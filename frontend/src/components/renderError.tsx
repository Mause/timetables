import * as React from 'react';

export default (error: any) => {
  const html = JSON.stringify(error, undefined, 2)
    .replace(/\n/g, '<br/>')
    .replace(/ /g, '&nbsp;');

  return <code dangerouslySetInnerHTML={{ __html: html }} />;
};
