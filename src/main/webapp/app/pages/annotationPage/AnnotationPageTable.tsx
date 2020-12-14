import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { LEVEL_TYPES, TABLE_COLUMN_KEY } from 'app/config/constants';
import { TherapeuticImplication } from 'app/store/AnnotationStore';
import React from 'react';

export const AnnotationPageTable: React.FunctionComponent<{
  implicationType: LEVEL_TYPES;
  implicationData: TherapeuticImplication[];
  column: SearchColumn<TherapeuticImplication>[];
}> = props => {
  return (
    <OncoKBTable
      data={props.implicationData}
      columns={props.column}
      pageSize={
        props.implicationData.length === 0 ? 1 : props.implicationData.length
      }
      disableSearch={true}
      defaultSorted={[
        {
          id: TABLE_COLUMN_KEY.LEVEL,
          desc: false,
        },
        {
          id: TABLE_COLUMN_KEY.ALTERATION,
          desc: false,
        },
      ]}
    />
  );
};
