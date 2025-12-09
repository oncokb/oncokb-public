import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Row, Col, Container } from 'react-bootstrap';
import styles from './StickyMiniNavBar.module.scss';
import classNames from 'classnames';
import classnames from 'classnames';
import ComingSoonTag from 'app/components/tag/ComingSoonTag';

function getNavBarSectionElements() {
  return document.querySelectorAll('[mini-nav-bar-header]');
}

function useScrollToHash({ stickyHeight }: { stickyHeight: number }) {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      let element: Element | null;
      try {
        element = document.querySelector(hash);
      } catch {
        element = null;
      }
      if (element) {
        const targetPosition =
          element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          behavior: 'smooth',
          top: targetPosition - stickyHeight,
        });
      }
    }
  }, [location]);
  return location.hash;
}

type IStickyMiniNavBar = {
  title: string | JSX.Element;
  stickyBackgroundColor?: string;
};

function getHeader() {
  return document.querySelector('header');
}

export const StickyMiniNavBarContext = createContext<{
  invalidateCache: () => void;
  counter: number;
}>({
  invalidateCache() {
    throw new Error(
      'StickyMiniNavBarContext was not set, please add a StickyMiniNavBarContextProvider'
    );
  },
  counter: 0,
});

export function StickyMiniNavBarContextProvider({
  children,
}: {
  children: React.ReactNode[];
}) {
  const [counter, setCounter] = useState(0);

  const invalidateCache = useCallback(() => {
    setCounter(x => x + 1);
  }, [setCounter]);
  return (
    <StickyMiniNavBarContext.Provider value={{ counter, invalidateCache }}>
      {children}
    </StickyMiniNavBarContext.Provider>
  );
}

export default function StickyMiniNavBar({
  title,
  stickyBackgroundColor,
}: IStickyMiniNavBar) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const [sections, setSections] = useState<
    { id: string; label: string | null; comingSoon: boolean }[]
  >([]);
  const [passedElements, setPassedElements] = useState<
    Record<string, { isPassed: boolean; isInView: boolean }>
  >({});
  const { counter } = useContext(StickyMiniNavBarContext);
  const stickyDivRef = useRef<HTMLDivElement | null>(null);
  useScrollToHash({
    stickyHeight:
      headerHeight +
      (stickyDivRef.current?.getBoundingClientRect().height ?? 0),
  });

  useEffect(() => {
    const newSections: typeof sections = [];
    const miniNavBarSections = getNavBarSectionElements();
    miniNavBarSections.forEach(ele => {
      newSections.push({
        id: ele.id,
        label: ele.textContent,
        comingSoon: ele.getAttribute('coming-soon') !== null ? true : false,
      });
    });
    setSections(newSections);

    const headerElement = getHeader();

    const updateHeaderHeight = () => {
      if (headerElement) {
        setHeaderHeight(headerElement.getBoundingClientRect().height);
      }
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    if (headerElement) {
      resizeObserver.observe(headerElement);
    }

    return () => {
      if (headerElement) {
        resizeObserver.unobserve(headerElement);
      }
    };
  }, [counter]);

  useEffect(() => {
    const miniNavBarSections = getNavBarSectionElements();
    const intersectionObserver = new IntersectionObserver(entries => {
      const newPassedElements: typeof passedElements = {};
      entries.forEach(entry => {
        const targetId = entry.target.getAttribute('id') ?? '';
        const hasId = sections.find(x => x.id === targetId);
        newPassedElements[targetId] = {
          isPassed:
            hasId !== undefined &&
            (entry.isIntersecting || entry.boundingClientRect.y < 0),
          isInView: hasId !== undefined && entry.isIntersecting,
        };
      });
      setPassedElements(x => {
        return {
          ...x,
          ...newPassedElements,
        };
      });
    });
    miniNavBarSections.forEach(x => intersectionObserver.observe(x));
    return () => {
      miniNavBarSections.forEach(x => intersectionObserver.unobserve(x));
    };
  }, [sections]);

  useEffect(() => {
    return () => {
      const headerElement = getHeader();
      if (headerElement) {
        headerElement.setAttribute('style', '');
      }
    };
  }, []);

  useEffect(() => {
    const miniNavElement = stickyDivRef.current;
    const headerElement = getHeader();
    if (!miniNavElement || !headerElement) {
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const miniNavTop = miniNavElement.getBoundingClientRect().top;
          const translateY = miniNavTop - headerHeight;
          headerElement.style.transform = `translateY(${Math.min(
            translateY,
            0
          )}px)`;
          setIsSticky(miniNavTop === 0);
          ticking = false;
        });
      }
      ticking = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerHeight]);

  let currentSectionId: string | undefined = undefined;

  // If a section header is visible then the header at the top of the page wins
  for (const section of sections) {
    const passedInfo = passedElements[section.id] ?? {};
    if (passedInfo.isInView) {
      currentSectionId = section.id;
      break;
    }
  }

  // If no section header is in view then pick the last section header
  // that was scrolled passed
  if (currentSectionId === undefined) {
    for (const section of sections) {
      const passedInfo = passedElements[section.id] ?? {};
      if (passedInfo.isPassed) {
        currentSectionId = section.id;
      }
    }
  }

  if (sections.length < 2) {
    return <></>;
  }

  return (
    <div
      className={classNames(
        styles.container,
        isSticky ? styles.containerSticky : ''
      )}
      style={{
        top: '0px',
        backgroundColor:
          isSticky && stickyBackgroundColor ? stickyBackgroundColor : undefined,
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={11}>
            <nav ref={stickyDivRef} className={classnames(styles.nav)}>
              {isSticky && (
                <Link
                  className={classnames(styles.stickyHeader)}
                  // # is removed from link so we have to use onclick to scroll to the top
                  to="#"
                  onClick={e => {
                    e.preventDefault();
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    });
                  }}
                >
                  {title}
                </Link>
              )}
              <div
                className="d-flex flex-row"
                style={{
                  gap: '10px',
                }}
              >
                {sections.map(({ id, label, comingSoon }) => {
                  const isInSection = currentSectionId === id;
                  return (
                    <Link
                      style={comingSoon ? { pointerEvents: 'none' } : undefined}
                      key={id}
                      to={`#${id}`}
                      className={classNames(
                        styles.stickySection,
                        isInSection ? styles.stickySectionSelected : ''
                      )}
                    >
                      <span
                        className={comingSoon ? 'text-secondary' : undefined}
                      >
                        {label}
                      </span>
                      {comingSoon && <ComingSoonTag className="ml-2" />}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
