import { DataProxy } from 'apollo-cache';
import {
  Box,
  Button,
  Control,
  Field,
  FieldBody,
  FieldLabel,
  Label,
  Title,
} from 'bloomer';
import gql from 'graphql-tag';
import * as React from 'react';
import { Component, createRef, FormEvent, RefObject } from 'react';
import { FetchResult, Mutation, MutationFn } from 'react-apollo';
import { GET_CLASSES } from './Classes';
import TimeRangeSelect from './TimeRangeSelect';
import { IClass, IClassInstance, IStudentShell } from './types';

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
          student { id }
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
  classes: IClass[];
}

class AddNewClassInstance extends Component<IAddNewClassProps, {}, {}> {
  private locationRef: RefObject<HTMLInputElement> = createRef();
  private rangeRef: RefObject<TimeRangeSelect> = createRef();
  private classRef: RefObject<HTMLSelectElement> = createRef();

  constructor(props: IAddNewClassProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }
  public render() {
    return (
      <form onSubmit={this.onSubmit}>
        <Box>
          <Title isSize={4}>Class Instance</Title>

          <Field isHorizontal={true}>
            <Field isHorizontal={true}>
              <FieldLabel isNormal={true}>
                <Label>Class</Label>
              </FieldLabel>
              <FieldBody>
                <Control>
                  <div className="select">
                    <select ref={this.classRef}>
                      {this.props.classes.map((cls, idx) => (
                        <option key={idx} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </Control>
              </FieldBody>
            </Field>
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
        </Box>
      </form>
    );
  }
  private async onSubmit(ev: FormEvent<any>) {
    ev.preventDefault();
    const lr = this.locationRef.current;

    await this.props.mutateFn({
      variables: {
        classId: this.classRef!.current!.value,
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

function update(
  cache: DataProxy,
  data: FetchResult<ICreateClassInstanceResult>,
) {
  const { classInstance } = data!.data!.createClassInstance;
  const student = classInstance.class.student;
  const arg = {
    query: GET_CLASSES,
    variables: { id: student!.id },
  };
  const res = cache.readQuery<IGetClassesQuery>(arg);
  const clazz = res!.student.classes.find(
    cl => cl.id === classInstance.class.id,
  );
  clazz!.instances.push(classInstance);
  cache.writeQuery({
    ...arg,
    data: { student: res!.student },
  });
}

interface IProps {
  classes: IClass[];
  student: IStudentShell;
}

export default ({ classes, student }: IProps) => {
  return (
    <Mutation mutation={ADD_CLASS_INSTANCE} update={update}>
      {(mutateFn, result) => (
        <AddNewClassInstance
          classes={classes}
          student={student}
          mutateFn={mutateFn}
          result={result}
        />
      )}
    </Mutation>
  );
};
