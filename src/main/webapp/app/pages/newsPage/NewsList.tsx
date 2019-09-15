import { NEWS_BY_DATE, NewsData } from 'app/pages/newsPage/NewsPageContent';
import moment from 'moment';
import React from 'react';
import { UpdatedTxImplListItem } from 'app/pages/newsPage/UpdatedTxImplListItem';
import { NewlyAddedGenesListItem, NewlyAddedGenesListItemProps } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { ChangedAnnotationListItem } from 'app/pages/newsPage/ChangedAnnotatonListItem';
import { UpdatedTxImplOldFormatListItem } from 'app/pages/newsPage/UpdatedTxImplOldFormatListItem';
import { ElementType } from 'app/components/SimpleTable';

export type NewsListProps = {
  date: string;
};

export const getNewsTitle = (date: string) => {
  return moment(date, 'MMDDYYYY').format('MMMM D, YYYY');
};

export const getNewsList = (data: ElementType[]) => {
  return data.map((element: string | JSX.Element) => <li key={element.toString()}>{element}</li>);
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
        {!!newsData ? (
          <ul>
            {!!newsData.priorityNews ? getNewsList(newsData.priorityNews) : undefined}
            {!!newsData.updatedImplication ? <UpdatedTxImplListItem data={newsData.updatedImplication} /> : undefined}
            {!!newsData.updatedImplicationInOldFormat ? (
              <UpdatedTxImplOldFormatListItem data={newsData.updatedImplicationInOldFormat} />
            ) : (
              undefined
            )}
            {!!newsData.changedAnnotation ? <ChangedAnnotationListItem data={newsData.changedAnnotation} /> : undefined}
            {getNewlyAddGeneSection()}
            {!!newsData.news ? getNewsList(newsData.news) : undefined}
          </ul>
        ) : (
          undefined
        )}
      </div>
    </>
  );
};
