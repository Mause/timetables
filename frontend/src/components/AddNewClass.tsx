import { DataProxy } from 'apollo-cache';
import { Box, Button, Control, Field, FieldBody, FieldLabel, Label, Title } from 'bloomer';
import gql from 'graphql-tag';
import * as React from 'react';
import { Component, createRef, FormEvent, RefObject } from 'react';
import { FetchResult, Mutation, MutationFn } from 'react-apollo';
import * as _ from 'underscore';
import { GET_CLASSES } from './Classes';
import { IClass, IStudent, IStudentShell } from './types';

const ADD_CLASS = gql`
  mutation CreateClass($name: String!, $studentId: ID!) {
    createClass(name: $name, studentId: $studentId) {
      class {
        id
        name
        instances {
          start
          end
          location
        }
        __typename
      }
      __typename
    }
  }
`;

interface ICreateClassMutation {
  name: string;
  studentId: string;
}
interface IResult {
  createClass: IClass;
}
interface IAddNewClassProps {
  mutateFn: MutationFn<IResult, ICreateClassMutation>;
  result: any;
  student: IStudentShell;
}

class AddNewClass extends Component<IAddNewClassProps, {}, {}> {
  private nameRef: RefObject<HTMLInputElement> = createRef();

  constructor(props: IAddNewClassProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }
  public render() {
    return (
      <form onSubmit={this.onSubmit}>
        <Box>
          <Title isSize={4}>New Class</Title>
          <Field isHorizontal={true}>
            <FieldLabel isNormal={true}>
              <Label>Name</Label>
            </FieldLabel>
            <FieldBody>
              <Field>
                <Control>
                  <input className="input" ref={this.nameRef} />
                </Control>
              </Field>
              <Field>
                <Control>
                  <Button isColor={"primary"}>
                    Submit
                  </Button>
                </Control>
              </Field>
            </FieldBody>
          </Field>
        </Box>
      </form>
    );
  }
  private async onSubmit(ev: FormEvent<any>) {
    ev.preventDefault();

    await this.props.mutateFn({
      variables: {
        name: this.nameRef.current!.value,
        studentId: this.props.student.id,
      },
    });

    this.nameRef.current!.value = '';
  }
}

interface ICreateClassResult {
  createClass: {
    class: IClass;
  };
}
interface IGetClassesQuery {
  student: {
    classes: IClass[];
  };
}

function update(
  student: IStudent,
  cache: DataProxy,
  data: FetchResult<ICreateClassResult>,
) {
  const createClass = data!.data!.createClass;
  const arg = {
    query: GET_CLASSES,
    variables: { id: student.id },
  };
  const res = cache.readQuery<IGetClassesQuery>(arg);
  const classes = res!.student.classes.concat([createClass.class]);
  const newStudent: IStudent = { ...student, classes };
  cache.writeQuery({
    ...arg,
    data: { student: newStudent },
  });
}

export default ({ student }: { student: IStudentShell }) => {
  return (
    <Mutation mutation={ADD_CLASS} update={_.partial(update, student)}>
      {(mutateFn, result) => (
        <AddNewClass student={student} mutateFn={mutateFn} result={result} />
      )}
    </Mutation>
  );
};
