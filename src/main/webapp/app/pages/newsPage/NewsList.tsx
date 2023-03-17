import { NEWS_BY_DATE, NewsData } from 'app/pages/newsPage/NewsPageContent';
import moment from 'moment';
import React from 'react';
import { UpdatedTxImplListItem } from 'app/pages/newsPage/UpdatedTxImplListItem';
import {
  NewlyAddedGenesListItem,
  NewlyAddedGenesListItemProps,
} from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { ChangedAnnotationListItem } from 'app/pages/newsPage/ChangedAnnotatonListItem';
import { UpdatedTxImplOldFormatListItem } from 'app/pages/newsPage/UpdatedTxImplOldFormatListItem';
import { ElementType, SimpleTableCell } from 'app/components/SimpleTable';
import {
  DATA_RELEASES,
  NEWS_DATE_FORMAT,
  NEWS_TITLE_DATE_FORMAT,
  PAGE_ROUTE,
} from 'app/config/constants';
import HashLink from 'app/shared/links/HashLink';
import { RouterStore } from 'mobx-react-router';
import { observable } from 'mobx';
import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';
import { GenePageLink } from 'app/shared/utils/UrlUtils';

export type NewsListProps = {
  date: string;
  routing?: RouterStore;
};

export const getNewsTitle = (date: string) => {
  return moment(date, NEWS_DATE_FORMAT).format(NEWS_TITLE_DATE_FORMAT);
};

const getNewsList = (data: SimpleTableCell[]) => {
  return data.map((element: SimpleTableCell) => (
    <li key={element.key}>{element.content}</li>
  ));
};

export const getNews = (news: {
  key: string;
  content: ElementType[] | undefined;
}) => {
  const data =
    news && news.content
      ? news.content.map((newsItem, index) => {
          return {
            key: `${news.key}-${index}`,
            content: newsItem,
          };
        })
      : [];
  return getNewsList(data);
};

@observer
export default class NewsList extends React.Component<NewsListProps> {
  @observable showAnchor = false;
  getNewlyAddGeneSection = (newsData: NewsData) => {
    if (newsData.newlyAddedGenes) {
      const componentProps: NewlyAddedGenesListItemProps = {
        genes: newsData.newlyAddedGenes,
      };
      if (newsData.newlyAddedGenesTypes) {
        componentProps.geneTypes = newsData.newlyAddedGenesTypes;
      }
      return (
        <li>
          <NewlyAddedGenesListItem {...componentProps} />
        </li>
      );
    } else {
      return undefined;
    }
  };

  render() {
    const date = this.props.date;
    const newsData: NewsData = NEWS_BY_DATE[date];
    return (
      <>
        <h3
          id={date}
          onMouseEnter={() => (this.showAnchor = true)}
          onMouseLeave={() => (this.showAnchor = false)}
        >
          {getNewsTitle(date)}
          {DATA_RELEASES.filter(item => item.date === date).length > 0 && (
            <span
              className={'ml-2'}
              style={{
                fontSize: '0.6em',
              }}
            >
              Data version:{' '}
              {DATA_RELEASES.filter(item => item.date === date)[0].version}
            </span>
          )}
          <HashLink path={PAGE_ROUTE.NEWS} hash={date} show={this.showAnchor} />
        </h3>
        <div className={'mb-3'}>
          {this.props.children ? (
            this.props.children
          ) : newsData ? (
            <ul>
              {getNews({
                key: `priority-news-${date}`,
                content: newsData.priorityNews,
              })}
              {newsData.updatedImplication ? (
                <UpdatedTxImplListItem
                  title={newsData.updatedImplicationTitle}
                  data={newsData.updatedImplication.map((item, index) => {
                    return {
                      key: `updatedImplication-${date}-${index}`,
                      content: item.map((subItem, subIndex) => {
                        const content: any =
                          subIndex === 1 && typeof subItem === 'string' ? (
                            <GenePageLink hugoSymbol={subItem} />
                          ) : (
                            subItem
                          );
                        return {
                          key: `updatedImplication-${date}-${index}-${subIndex}`,
                          content,
                        };
                      }),
                    };
                  })}
                  numOfAssociationsInUpdatedImplication={
                    newsData.numOfAssociationsInUpdatedImplication
                  }
                />
              ) : undefined}
              {newsData.updatedImplicationInOldFormat ? (
                <UpdatedTxImplOldFormatListItem
                  data={newsData.updatedImplicationInOldFormat}
                  key={`UpdatedTxImplOldFormatListItem-${date}`}
                />
              ) : undefined}
              {newsData.changedAnnotation ? (
                <ChangedAnnotationListItem
                  title={newsData.changedAnnotationTitle}
                  columnHeaderType={newsData.changedAnnotationColumnHeaderType}
                  data={newsData.changedAnnotation.map((item, index) => {
                    return {
                      key: `changedAnnotation-${date}-${index}`,
                      content: item.map((subItem, subIndex) => {
                        const content: any =
                          subIndex === 0 && typeof subItem === 'string' ? (
                            <GenePageLink hugoSymbol={subItem} />
                          ) : (
                            subItem
                          );
                        return {
                          key: `changedAnnotation-${date}-${index}-${subIndex}`,
                          content: subItem,
                        };
                      }),
                    };
                  })}
                />
              ) : undefined}
              {getNews({
                key: `news-${date}`,
                content: newsData.news ? newsData.news : [],
              })}
              {this.getNewlyAddGeneSection(newsData)}
            </ul>
          ) : undefined}
        </div>
      </>
    );
  }
}
