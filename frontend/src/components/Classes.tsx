import { DataProxy } from 'apollo-cache';
import { Delete, Select } from 'bloomer';
import gql from 'graphql-tag';
import * as moment from 'moment';
import * as React from 'react';
import { Component, FormEvent, ReactNode } from 'react';
import {
  compose,
  FetchResult,
  graphql,
  MutationOptions,
  Query,
  QueryResult,
} from 'react-apollo';
import * as TreeView from 'react-treeview';
import 'react-treeview/react-treeview.css';
import * as _ from 'underscore';
import AddNewClass from './AddNewClass';
import AddNewClassInstance from './AddNewClassInstance';
import renderError from './renderError';
import { IClass, IClassInstance, IStudent } from './types';

interface IClassesQuery {
  student: IStudent;
}

interface IDeleteClassInstanceVariables {
  id: string;
}
interface IDeleteClassInstanceData {
  deleteClassInstance: {
    classInstance: {
      id: string;
      class: {
        id: string;
      };
    };
  };
}
type IDeleteClassInstanceOptions = MutationOptions<
  IDeleteClassInstanceData,
  IDeleteClassInstanceVariables
>;
interface IDeleteClassVariables {
  id: string;
}
interface IDeleteClassData {
  deleteClass: { class: { id: string } };
}
type IDeleteClassOptions = MutationOptions<
  IDeleteClassData,
  IDeleteClassVariables
>;

interface IClassesProps {
  qr: QueryResult<IClassesQuery>;
  student: IStudent;
  DeleteClassInstance: (options: IDeleteClassInstanceOptions) => void;
  DeleteClass: (options: IDeleteClassOptions) => void;
}

const EMPTY: IClass[] = new Array<IClass>();

type EventAndId = (ev: FormEvent<any>, id: string) => void;

function render<T>(
  t: T & { id: string },
  renderLabel: (t: T) => ReactNode,
  onClick: EventAndId,
): ReactNode {
  const onClickBound = (ev: FormEvent<any>) => onClick(ev, t.id);
  return (
    <span>
      <Delete onClick={onClickBound} /> <span>{renderLabel(t)}</span>
    </span>
  );
}

function renderCI(ci: IClassInstance, onClick: EventAndId): ReactNode {
  const F = (d: moment.Moment) => d.format('hh:mma');
  const start = moment.utc(ci.start);
  const day = moment.weekdaysShort(start.day());

  return render(
    ci,
    i => `${day} ${F(start)} -> ${F(moment.utc(ci.end))} @ ${ci.location}`,
    onClick,
  );
}
function renderC(c: IClass, onClick: EventAndId): ReactNode {
  return render(c, i => i.name, onClick);
}
interface IClassesState {
  classId?: string;
}

class Classes extends Component<IClassesProps, IClassesState, {}> {
  constructor(props: IClassesProps) {
    super(props);
    this.onClassChange = this.onClassChange.bind(this);
    this.state = { classId: undefined };
    this.onClickClass = this.onClickClass.bind(this);
    this.onClickClassInstance = this.onClickClassInstance.bind(this);
  }
  public render() {
    const { qr: { error, loading, data }, student } = this.props;
    if (error) {
      return renderError(error);
    }

    const classes: IClass[] = loading ? EMPTY : data!.student.classes || EMPTY;

    return (
      <div>
        <AddNewClass student={student} />
        <hr />
        <Select onChange={this.onClassChange}>
          {classes.map((cls, idx) => (
            <option key={idx} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </Select>
        <AddNewClassInstance
          classId={
            this.state.classId || (classes && classes[0] && classes[0].id)
          }
          student={student}
        />
        <hr />

        {loading ? <div>Loading...</div> : null}

        <div>
          {classes.map((cls, index) => (
            <TreeView nodeLabel={renderC(cls, this.onClickClass)} key={index}>
              {cls.instances.map((ins, idx) => (
                <TreeView
                  key={idx}
                  nodeLabel={renderCI(ins, this.onClickClassInstance)}
                />
              ))}
            </TreeView>
          ))}
        </div>
      </div>
    );
  }
  private update(
    cache: DataProxy,
    { data }: FetchResult<IDeleteClassInstanceData>,
  ) {
    const arg = {
      query: GET_CLASSES,
      variables: { id: this.props.student.id },
    };
    const res = cache.readQuery<IClassesQuery>(arg);
    const { classInstance } = data!.deleteClassInstance;
    const instances = res!.student!.classes!.find(
      cl => cl.id === classInstance.class.id,
    )!.instances;
    const idx = _.findIndex(instances, i => i.id === classInstance.id);
    instances.splice(idx, 1);
    cache.writeQuery({
      ...arg,
      data: { student: res!.student },
    });
  }
  private onClickClassInstance(ev: FormEvent<any>, classInstanceId: string) {
    ev.preventDefault();
    this.props.DeleteClassInstance({
      update: this.update.bind(this),
      variables: { id: classInstanceId },
    });
  }
  private onClickClass(ev: FormEvent<any>, classId: string) {
    ev.preventDefault();
    this.props.DeleteClass({
      update: this.updateClass.bind(this),
      variables: { id: classId },
    });
  }
  private updateClass(
    cache: DataProxy,
    { data }: FetchResult<IDeleteClassData>,
  ) {
    const arg = {
      query: GET_CLASSES,
      variables: { id: this.props.student.id },
    };
    const res = cache.readQuery<IClassesQuery>(arg);
    const classes = res!.student!.classes;
    if (classes === undefined) {
      return;
    }
    const idx = _.findIndex(
      classes,
      cl => cl.id === data!.deleteClass.class.id,
    );
    classes.splice(idx, 1);
    cache.writeQuery({
      ...arg,
      data: { student: res!.student },
    });
  }
  private onClassChange(ev: FormEvent<HTMLSelectElement>) {
    this.setState({ classId: ev.currentTarget.value });
  }
}

export const GET_CLASSES = gql`
  query ClassesQuery($id: ID!) {
    student(id: $id) {
      id
      classes {
        id
        name
        __typename
        instances {
          id
          start
          end
          location
          class {
            id
          }
          __typename
        }
      }
      __typename
    }
  }
`;

const DeleteClassInstanceMutation = gql`
  mutation DeleteClassInstance($id: ID!) {
    deleteClassInstance(id: $id) {
      classInstance {
        id
        class {
          id
        }
      }
    }
  }
`;
const DeleteClassMutation = gql`
  mutation DeleteClass($id: ID!) {
    deleteClass(id: $id) {
      class {
        id
      }
    }
  }
`;

export default compose(
  graphql(DeleteClassInstanceMutation, { name: 'DeleteClassInstance' }),
  graphql(DeleteClassMutation, { name: 'DeleteClass' }),
)(
  ({
    student,
    DeleteClassInstance,
    DeleteClass,
  }: {
    student: IStudent;
    DeleteClassInstance: (options: IDeleteClassInstanceOptions) => void;
    DeleteClass: (options: IDeleteClassOptions) => void;
  }) => (
    <Query query={GET_CLASSES} variables={{ id: student.id }}>
      {qr => (
        <Classes
          DeleteClass={DeleteClass}
          DeleteClassInstance={DeleteClassInstance}
          qr={qr}
          student={student}
        />
      )}
    </Query>
  ),
);
