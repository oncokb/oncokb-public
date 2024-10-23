import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Row, Col, Container } from 'react-bootstrap';
import styles from './StickyMiniNavBar.module.scss';
import classNames from 'classnames';
import { COLOR_WHITE } from 'app/config/theme';

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
  title: string | JSX.Element
  linkUnderlineColor: string;
  stickyBackgroundColor?: string;
};

export default function StickyMiniNavBar({
  title,
  linkUnderlineColor,
  stickyBackgroundColor,
}: IStickyMiniNavBar) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const [sections, setSections] = useState<
    { id: string; label: string | null }[]
  >([]);
  const [passedElements, setPassedElements] = useState<
    Record<string, { isPassed: boolean; isInView: boolean }>
  >({});
  const stickyDivRef = useRef<HTMLDivElement | null>(null);
  const hash = useScrollToHash({
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
      });
    });
    setSections(newSections);

    const headerElement = document.querySelector('header');

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
  }, []);

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

  const handleScroll = () => {
    if (stickyDivRef.current) {
      const stickyOffset = stickyDivRef.current.getBoundingClientRect().top;
      setIsSticky(stickyOffset <= headerHeight);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerHeight]);

  const currentSectionId = [...sections].sort(
    ({ id: leftId }, { id: rightId }) => {
      const leftPassedInfo = passedElements[leftId] ?? {};
      const rightPassedInfo = passedElements[rightId] ?? {};
      if (`#${leftId}` === hash && leftPassedInfo.isInView) {
        return -1;
      } else if (`#${rightId}` === hash && rightPassedInfo.isInView) {
        return 1;
      } else if (leftPassedInfo.isInView && !rightPassedInfo.isInView) {
        return -1;
      } else if (rightPassedInfo.isInView && !leftPassedInfo.isInView) {
        return 1;
      } else if (rightPassedInfo.isPassed) {
        return 1;
      } else if (leftPassedInfo.isPassed) {
        return -1;
      } else {
        return 0;
      }
    }
  )[0]?.id;

  return (
    <Container
      className={classNames('container', styles.container)}
      style={{
        position: 'sticky',
        top: headerHeight,
        zIndex: 100,
        borderBottom: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: '#E3E5EC',
        boxShadow: isSticky ? '0px 0.75px 2px 0px rgba(0, 22, 65, 0.10), 0px 1.5px 4px 0px rgba(0, 22, 65, 0.10), 0px 3px 8px 0px rgba(0, 22, 65, 0.10)' : undefined,
        backgroundColor: isSticky ? (stickyBackgroundColor ? stickyBackgroundColor : COLOR_WHITE) : undefined,
      }}
    >
      <Row className="justify-content-center">
        <Col md={11}>
          <nav
            ref={stickyDivRef}
            className="d-flex flex-row"
            style={{
              gap: '40px',
              height: '49px',
            }}
          >
            {isSticky && (
              <Link
                className="font-weight-bold d-flex align-items-center justify-content-center"
                // # is removed from link so we have to use onclick to scroll to the top
                to="#"
                style={{
                  color: '#000000',
                  fontFamily: 'Gotham Bold',
                  padding: '7px 0px',
                }}
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
              {sections.map(({ id, label }) => {
                const isInSection = currentSectionId === id;
                return (
                  <Link
                    key={id}
                    to={`#${id}`}
                    className={classNames(
                      'd-flex',
                      'align-items-center',
                      'justify-content-center',
                      isInSection ? 'font-weight-bold' : 'font-weight-normal'
                    )}
                    style={{
                      color: '#000000',
                      borderColor: isInSection
                        ? linkUnderlineColor
                        : 'transparent',
                      borderBottomStyle: 'solid',
                      borderBottomWidth: '4px',
                      fontFamily: isInSection ? 'Gotham Bold' : 'Gotham Book',
                      padding: '7px 0px 3px 0',
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </Col>
      </Row>
    </Container>
  );
}
