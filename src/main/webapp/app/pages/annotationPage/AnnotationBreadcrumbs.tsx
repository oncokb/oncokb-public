import React, { useState } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Else, If, Then } from 'react-if';
import Select from 'react-select';
import { REFERENCE_GENOME } from 'app/config/constants';
import { COLOR_BLUE } from 'app/config/theme';

export type BreadcrumbType = 'text' | 'link' | 'input' | 'dropdown';

export interface IBasicBreadcrumb {
  type: BreadcrumbType;
  active?: boolean;
  key: string;
  text: string;
}

export interface ITextBreadcrumb extends IBasicBreadcrumb {
  type: 'text';
}

export interface ILinkBreadcrumb extends IBasicBreadcrumb {
  type: 'link';
  to: string;
}

export interface IInputBreadcrumb extends IBasicBreadcrumb {
  type: 'input';
  onChange: () => void;
}

export interface IDropdownBreadcrumb extends IBasicBreadcrumb {
  type: 'dropdown';
  onChange: () => void;
  options: string[];
}

const Icon: React.FunctionComponent<{
  iconClassName: string;
  onClick: () => void;
  colorClassName?: string;
}> = props => {
  return (
    <i
      className={`fa fa-${props.iconClassName} ml-1 ${props.colorClassName}`}
      style={{ cursor: 'pointer' }}
      onClick={props.onClick}
    ></i>
  );
};
const TextBreadcrumb: React.FunctionComponent<IBasicBreadcrumb> = props => {
  return (
    <Breadcrumb.Item key={props.key} active={props.active}>
      {props.text}
    </Breadcrumb.Item>
  );
};

const LinkBreadcrumb: React.FunctionComponent<ILinkBreadcrumb> = props => {
  return (
    <Breadcrumb.Item
      key={props.key}
      linkAs={Link}
      linkProps={{ to: props.to }}
      active={props.active}
    >
      {props.text}
    </Breadcrumb.Item>
  );
};

const InputBreadcrumb: React.FunctionComponent<IInputBreadcrumb> = props => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(props.text);
  const editableContentFontSize = '13px';
  return (
    <Breadcrumb.Item key={props.key} active style={{ color: COLOR_BLUE }}>
      <If condition={editing}>
        <Then>
          <span style={{ fontSize: editableContentFontSize }}>
            <input
              type={'text'}
              value={text}
              style={{ border: '1px solid lightgrey', borderRadius: 4 }}
              onChange={e => setText(e.target.value)}
            />
            <Icon
              colorClassName="text-success"
              iconClassName="check"
              onClick={() => setEditing(true)}
            />
            <Icon
              colorClassName="text-danger"
              iconClassName="times"
              onClick={() => setEditing(true)}
            />
          </span>
        </Then>
        <Else>
          {props.text}
          <Icon
            iconClassName="pencil-square-o"
            onClick={() => setEditing(true)}
          />
        </Else>
      </If>
    </Breadcrumb.Item>
  );
};

const DropdownBreadcrumb: React.FunctionComponent<IDropdownBreadcrumb> = props => {
  const [editing, setEditing] = useState(false);
  return (
    <Breadcrumb.Item key={props.key} active style={{ color: COLOR_BLUE }}>
      <If condition={editing}>
        <Then>
          <Select
            menuIsOpen
            theme={theme => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: COLOR_BLUE,
              },
            })}
            styles={{
              control: baseStyles => ({
                ...baseStyles,
                fontSize: 12,
                width: 110,
                minHeight: 10,
              }),
              option: baseStyles => ({
                ...baseStyles,
                fontSize: 12,
                paddingTop: 5,
                paddingBottom: 5,
              }),
              indicatorSeparator: baseStyles => ({
                ...baseStyles,
                marginTop: 5,
                marginBottom: 5,
              }),
              dropdownIndicator: baseStyles => ({
                ...baseStyles,
                width: 30,
                paddingTop: 0,
                paddingBottom: 0,
              }),
              input: baseStyles => ({
                ...baseStyles,
                margin: 0,
                padding: 0,
              }),
            }}
            options={props.options.map(option => {
              return { label: option, value: option };
            })}
            onChange={() => {
              props.onChange();
              setEditing(false);
            }}
            defaultValue={{
              label: props.text,
              value: props.text,
            }}
          />
        </Then>
        <Else>
          {props.text}
          <Icon
            iconClassName="pencil-square-o"
            onClick={() => setEditing(true)}
          />
        </Else>
      </If>
    </Breadcrumb.Item>
  );
};

export const AnnotationBreadcrumbs: React.FunctionComponent<{
  breadcrumbs: (
    | ITextBreadcrumb
    | ILinkBreadcrumb
    | IInputBreadcrumb
    | IDropdownBreadcrumb
  )[];
}> = props => {
  return (
    <Breadcrumb>
      {props.breadcrumbs.map((breadcrumb, index) => {
        const commonProps: IBasicBreadcrumb = {
          type: 'text',
          key: breadcrumb.key,
          text: breadcrumb.text,
          active: index === props.breadcrumbs.length - 1,
        };
        switch (breadcrumb.type) {
          case 'text':
            return <TextBreadcrumb {...commonProps} />;
          case 'link':
            return (
              <LinkBreadcrumb
                {...commonProps}
                type={'link'}
                to={breadcrumb.to}
              />
            );
          case 'dropdown':
            return (
              <DropdownBreadcrumb
                {...commonProps}
                type={'dropdown'}
                options={[REFERENCE_GENOME.GRCh37, REFERENCE_GENOME.GRCh38]}
                onChange={() => null}
              />
            );
          case 'input':
            return (
              <InputBreadcrumb
                {...commonProps}
                type={'input'}
                onChange={() => null}
              />
            );
          default:
            return <TextBreadcrumb {...commonProps} type={'text'} />;
        }
      })}
    </Breadcrumb>
  );
};
