import { DataProxy } from 'apollo-cache';
import { Button, Control, Field, FieldBody, FieldLabel, Label } from 'bloomer';
import gql from 'graphql-tag';
import * as React from 'react';
import { Component, createRef, FormEvent, RefObject } from 'react';
import { FetchResult, Mutation, MutationFn } from 'react-apollo';
import * as _ from 'underscore';
import { GET_CLASSES } from './Classes';
import TimeRangeSelect from './TimeRangeSelect';
import { IClassInstance, IStudent, IStudentShell } from './types';

const ADD_CLASS_INSTANCE = gql`
  mutation CreateClassInstance(
    $location: String!
    $start: DateTime!
    $end: DateTime!
    $classId: ID!
  ) {
    createClassInstance(
      location: $location
      start: $start
      end: $end
      classId: $classId
    ) {
      classInstance {
        id
        location
        start
        end
        class {
          id
        }
      }
    }
  }
`;

interface ICreateClassMutation {
  location: string;
  start: Date;
  end: Date;
  classId: string;
}
interface IResult {
  createClass: IClassInstance;
}
interface IAddNewClassProps {
  mutateFn: MutationFn<IResult, ICreateClassMutation>;
  result: any;
  student: IStudentShell;
  classId: string;
}

class AddNewClassInstance extends Component<IAddNewClassProps, {}, {}> {
  private locationRef: RefObject<HTMLInputElement> = createRef();
  private rangeRef: RefObject<TimeRangeSelect> = createRef();

  constructor(props: IAddNewClassProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }
  public render() {
    return (
      <form onSubmit={this.onSubmit}>
        <Field isHorizontal={true}>
          <Field isHorizontal={true}>
            <FieldLabel isNormal={true}>
              <Label>Location:</Label>
            </FieldLabel>
            <FieldBody>
              <Control>
                <input className="input" ref={this.locationRef} />
              </Control>
            </FieldBody>
          </Field>
          <TimeRangeSelect ref={this.rangeRef} />
        </Field>
        <Button type="submit">Submit</Button>
      </form>
    );
  }
  private async onSubmit(ev: FormEvent<any>) {
    ev.preventDefault();
    const lr = this.locationRef.current;

    await this.props.mutateFn({
      variables: {
        classId: this.props.classId,
        end: this.rangeRef.current!.endAsDate().toDate(),
        location: lr!.value,
        start: this.rangeRef.current!.startAsDate().toDate(),
      },
    });

    lr!.value = '';
  }
}

interface ICreateClassInstanceResult {
  createClassInstance: {
    classInstance: IClassInstance;
  };
}
interface IGetClassesQuery {
  student: {
    classes: Array<{
      id: string;
      instances: IClassInstance[];
    }>;
  };
}

// const GET_CLASS_INSTANCES = gql`
//   query GetClassInstances($studentId: ID!, $classId: ID!) {
//     student(id: $studentId) {
//       class(id: $classId) {
//         instances
//       }
//     }
//   }
// `;

function update(
  student: IStudent,
  classId: string,
  cache: DataProxy,
  data: FetchResult<ICreateClassInstanceResult>,
) {
  const createClass = data!.data!.createClassInstance;
  const arg = {
    query: GET_CLASSES,
    variables: { id: student.id },
  };
  const res = cache.readQuery<IGetClassesQuery>(arg);
  const clazz = res!.student.classes.find(cl => cl.id === classId);
  clazz!.instances.push(createClass.classInstance);
  cache.writeQuery({
    ...arg,
    data: { student: res!.student },
  });
}

interface IProps {
  classId: string;
  student: IStudentShell;
}

export default ({ classId, student }: IProps) => {
  return (
    <Mutation
      mutation={ADD_CLASS_INSTANCE}
      update={_.partial(update, student, classId)}
    >
      {(mutateFn, result) => (
        <AddNewClassInstance
          classId={classId}
          student={student}
          mutateFn={mutateFn}
          result={result}
        />
      )}
    </Mutation>
  );
};
