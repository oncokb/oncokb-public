import { NEWS_BY_DATE, NewsData } from 'app/pages/newsPage/NewsPageContent';
import moment from 'moment';
import React from 'react';
import { UpdatedTxImplListItem } from 'app/pages/newsPage/UpdatedTxImplListItem';
import { NewlyAddedGenesListItem, NewlyAddedGenesListItemProps } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { ChangedAnnotationListItem } from 'app/pages/newsPage/ChangedAnnotatonListItem';
import { UpdatedTxImplOldFormatListItem } from 'app/pages/newsPage/UpdatedTxImplOldFormatListItem';
import { ElementType, SimpleTableCell, SimpleTableRow, SimpleTableRows } from 'app/components/SimpleTable';

export type NewsListProps = {
  date: string;
};

export const getNewsTitle = (date: string) => {
  return moment(date, 'MMDDYYYY').format('MMMM D, YYYY');
};

const getNewsList = (data: SimpleTableCell[]) => {
  return data.map((element: SimpleTableCell) => <li key={element.key}>{element.content}</li>);
};

export const getNews = (news: { key: string, content: ElementType[] | undefined }) => {
  const data = (news && news.content) ? news.content.map((newsItem, index) => {
    return {
      key: `${news.key}-${index}`,
      content: newsItem
    };
  }) : [];
  return getNewsList(data);
};

export const NewsList = (props: NewsListProps) => {
  const date = props.date;
  const newsData: NewsData = NEWS_BY_DATE[date];

  const getNewlyAddGeneSection = () => {
    if (newsData.newlyAddedGenes) {
      const componentProps: NewlyAddedGenesListItemProps = {
        genes: newsData.newlyAddedGenes
      };
      if (newsData.newlyAddedGenesTypes) {
        componentProps.geneTypes = newsData.newlyAddedGenesTypes;
      }
      return <NewlyAddedGenesListItem {...componentProps} />;
    } else {
      return undefined;
    }
  };

  return (
    <>
      <h3>{getNewsTitle(date)}</h3>
      <div>
        {newsData ? (
          <ul>
            {getNews({
              key: `priority-news-${date}`,
              content: newsData.priorityNews
            })}
            {newsData.updatedImplication ?
              <UpdatedTxImplListItem data={newsData.updatedImplication.map((item, index) => {
                return {
                  key: `updatedImplication-${date}-${index}`,
                  content: item.map((subItem, subIndex) => {
                    return {
                      key: `updatedImplication-${date}-${index}-${subIndex}`,
                      content: subItem
                    };
                  })
                };
              })}/> : undefined}
            {newsData.updatedImplicationInOldFormat ? (
              <UpdatedTxImplOldFormatListItem data={newsData.updatedImplicationInOldFormat} key={`UpdatedTxImplOldFormatListItem-${date}`}/>
            ) : (
              undefined
            )}
            {newsData.changedAnnotation ?
              <ChangedAnnotationListItem data={newsData.changedAnnotation.map((item, index) => {
                return {
                  key: `changedAnnotation-${date}-${index}`,
                  content: item.map((subItem, subIndex) => {
                    return {
                      key: `changedAnnotation-${date}-${index}-${subIndex}`,
                      content: subItem
                    };
                  })
                };
              })}/> : undefined}
            {getNewlyAddGeneSection()}
            {getNews({
              key: `news-${date}`,
              content: newsData.news ? newsData.news:[]
            })}
          </ul>
        ) : (
          undefined
        )}
      </div>
    </>
  );
};
