import * as moment from 'moment';
import * as _ from 'underscore';

export const weekday = (d: moment.Moment) => moment.weekdaysShort(d.day());

const t = moment()
  .startOf('isoWeek')
  .subtract(1, 'day');
export default _.times(7, idx => t.add(1, 'day').format('ddd'));
