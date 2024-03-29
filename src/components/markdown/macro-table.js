import React from 'react';
import PropTypes from 'prop-types';
import toPath from 'lodash/toPath';
import nestedGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import OrigMarkdown from 'react-markdown/with-html';

import macroPlugin from './macro-plugin';
import SimpleTable, {ColumnDef} from '../simple-table';
import {createUnsafeRenderFromTpl} from '../simple-table/column-def';

import style from './style.module.scss';

macroPlugin.addMacro('table', (content, props) => {
  return {
    ...props,
    type: 'TableNode',
    tableName: content.trim()
  };
});


function nl2brMdText(text) {
  if (typeof text === 'string') {
    return text.replace(/([^\n]|^)\n(?!\n)/g, '$1  \n');
  }
  else {
    return text;
  }
}


function defaultRenderer(mdProps, cmsPrefix) {
  return value => {
    if (typeof value === 'string') {
      value = value.replace(/\$\$CMS_PREFIX\$\$/g, cmsPrefix);
      return <OrigMarkdown {...mdProps} source={value} />;
    }
    else {
      return value;
    }
  };
}


const renderFuncs = {

  default: defaultRenderer,

  template: (tpl, mdProps, cmsPrefix) => {
    const renderTpl = createUnsafeRenderFromTpl(tpl, true);
    return (...args) => defaultRenderer(mdProps, cmsPrefix)(renderTpl(...args));
  },

  nl2br(mdProps, cmsPrefix) {
    return value => defaultRenderer(mdProps, cmsPrefix)(nl2brMdText(value));
  },

  join(mdProps, cmsPrefix) {
    return (value, row, context, {joinBy = ''}) => {
      if (!value) {
        return null;
      }
      return defaultRenderer(mdProps, cmsPrefix)(value.join(joinBy));
    };
  },

  articleList(mdProps, cmsPrefix) {
    const freeTextRenderer = defaultRenderer(mdProps, cmsPrefix);
    return (articles) => <>
      {articles.map(({
        doi,
        firstAuthor: {surname} = {},
        year,
        journal,
        journalShort,
        freeText
      }, idx) => <div key={idx}>
        {freeText ?
          freeTextRenderer(freeText) : <>
            <a
             href={`https://doi.org/${doi}`}
             rel="noopener noreferrer"
             target="_blank">
              {surname} {year}
            </a>
            {' '}({journalShort ? journalShort : journal})
          </>}
      </div>)}
    </>;
  },

  compoundEC50Obj(mdProps, cmsPrefix) {
    const freeTextRenderer = defaultRenderer(mdProps, cmsPrefix);
    return (compounds) => {
      if (!(compounds instanceof Array)) {
        compounds = [];
      }
      const content = compounds.map(({name, ec50, ec50Note}) => {
        const part = [`${name}`];
        if (ec50 && ec50Note) {
          part.push(` (${ec50}, ${ec50Note})`);
        }
        else if (ec50) {
          part.push(` (${ec50})`);
        }
        return `${part.join('')}  `;
      }).join('\n');
      return freeTextRenderer(content);
    };
  },

  nowrap(mdProps, cmsPrefix) {
    return value => <span className={style.nowrap}>
      {defaultRenderer(mdProps, cmsPrefix)(value)}
    </span>;
  },

  checkMark() {
    return value => value ? '\u2713' : '';
  }

};

const sortFuncs = {

  articleList: rows => sortBy(rows, ({references}) => references.map(
    ({firstAuthor: {surname} = [], year}) => [surname, -year]
  )),

  numeric: (rows, column) => sortBy(
    rows,
    row => parseInt(nestedGet(row, column))
  )

};


function buildColumnDefs(columnDefs, mdProps, cmsPrefix) {
  const objs = [];
  const colHeaderRenderer = renderFuncs.nl2br(mdProps);
  for (const colDef of columnDefs) {
    let {render, renderTpl, sort, label, ...props} = colDef;
    if (typeof render === 'string') {
      render = renderFuncs[render](mdProps, cmsPrefix);
    }
    else if (renderTpl) {
      render = renderFuncs.template(renderTpl, mdProps, cmsPrefix);
    }
    else {
      render = renderFuncs.default(mdProps, cmsPrefix);
    }
    if (typeof sort === 'string') {
      sort = sortFuncs[sort];
    }
    if (colDef.label) {
      label = colHeaderRenderer(label);
    }
    objs.push(new ColumnDef({
      render, sort, label, ...props
    }));
  }
  return objs;
}


function expandMultiCells(data, columnDefs) {
  let expandTarget = null;
  for (const {name, multiCells} of columnDefs) {
    if (!multiCells) {
      continue;
    }
    const [attr] = toPath(name);
    if (expandTarget && expandTarget !== attr) {
      throw new Error(
        'Can only expand one attribute of a row group, ' +
        `but two were specified: ${expandTarget} and ${attr}`
      );
    }
    expandTarget = attr;
  }
  if (expandTarget === null) {
    return data;
  }
  const newRows = [];
  for (let i = 0; i < data.length; i ++) {
    const {...row} = data[i];
    const [...subRows] = row[expandTarget];
    delete row[expandTarget];
    for (const subRow of subRows) {
      const newRow = {...row, _spanIndex: i};
      newRow[expandTarget] = subRow;
      newRows.push(newRow);
    }
  }
  return newRows;
}


InlineParagraph.propTypes = {
  children: PropTypes.node
};

function InlineParagraph({children}) {
  return <>{children}</>;
}


Table.propTypes = {
  cacheKey: PropTypes.string,
  columnDefs: PropTypes.array,
  data: PropTypes.array,
  compact: PropTypes.bool,
  lastCompact: PropTypes.bool,
  noHeaderOverlapping: PropTypes.bool,
  windowScroll: PropTypes.bool,
  references: PropTypes.array,
  mdProps: PropTypes.shape({
    renderers: PropTypes.object
  }),
  cmsPrefix: PropTypes.string,
  tableScrollStyle: PropTypes.object,
  tableStyle: PropTypes.object
};


export function Table({
  cacheKey,
  columnDefs,
  data,
  compact,
  lastCompact,
  noHeaderOverlapping,
  windowScroll,
  references,
  mdProps: {renderers, ...mdProps},
  cmsPrefix,
  tableScrollStyle = {},
  tableStyle = {}
}) {
  renderers = {
    ...renderers,
    paragraph: InlineParagraph
  };
  columnDefs = buildColumnDefs(columnDefs, {...mdProps, renderers}, cmsPrefix);
  data = expandMultiCells(data, columnDefs);

  return <>
    <SimpleTable
     key={cacheKey}
     compact={compact}
     lastCompact={lastCompact}
     noHeaderOverlapping={noHeaderOverlapping}
     windowScroll={windowScroll}
     cacheKey={cacheKey}
     tableScrollStyle={tableScrollStyle}
     tableStyle={tableStyle}
     columnDefs={columnDefs}
     data={data} />
    <OrigMarkdown
     {...mdProps}
     renderers={renderers}
     source={references} />
  </>;
}

export default function TableNodeWrapper({tables, mdProps, cmsPrefix}) {
  return ({
    tableName, // eslint-disable-line react/prop-types
    compact, // eslint-disable-line react/prop-types
    lastCompact, // eslint-disable-line react/prop-types
    noHeaderOverlapping, // eslint-disable-line react/prop-types
    windowScroll // eslint-disable-line react/prop-types
  }) => {
    compact = compact !== undefined;
    lastCompact = lastCompact !== undefined;
    if (tableName in tables) {
      return (
        <Table
         key={tableName}
         compact={compact}
         lastCompact={lastCompact}
         noHeaderOverlapping={noHeaderOverlapping}
         windowScroll={windowScroll}
         cacheKey={tableName}
         mdProps={mdProps}
         cmsPrefix={cmsPrefix}
         {...tables[tableName]} />
      );
    }
    else {
      return <div>
        <strong>Error</strong>: table data of {tableName} is not found.
      </div>;
    }
  };
}
