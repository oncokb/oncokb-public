import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function TableOfContents() {
  const [headers, setHeaders] = useState<JSX.Element[]>();
  useEffect(() => {
    const docHeaders = document.querySelectorAll(`main h2`);

    const elements: JSX.Element[] = [];
    docHeaders.forEach(headerElement => {
      const innerText = (headerElement as HTMLHeadingElement).innerText;
      const y = headerElement.getBoundingClientRect().top + window.scrollY;
      elements.push(
        <li>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              window.scrollTo({ top: y, behavior: 'smooth' });
            }}
          >
            {innerText}
          </a>
        </li>
      );
    });

    setHeaders(elements);
  }, []);

  if (!headers) {
    return <></>;
  }
  return (
    <>
      <h2>Table of Contents</h2>
      <ul>{headers}</ul>
    </>
  );
}
