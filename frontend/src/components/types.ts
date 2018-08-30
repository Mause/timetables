export interface ITimetable {
  id: string;
  days: IDay[];
}

export interface IDay {
  index: number;
  classes: IClassInstance[];
}

export interface IClassInstance {
  id: string;
  start: Date;
  end: Date;
  location: string;
  class: IClass;
}

export interface IClass {
  id: string;
  name: string;
  instances: IClassInstance[]
}

export interface IStudentShell {
  name: string;
  id: string;
}

export interface IStudent extends IStudentShell {
  sid: string;
  classes?: IClass[];
}

export interface IDayTime {
  day: number;
  time: string;
}
