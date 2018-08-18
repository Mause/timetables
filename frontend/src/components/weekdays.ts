import * as moment from 'moment';
import * as _ from 'underscore';

const t = moment()
  .startOf('isoWeek')
  .subtract(1, 'day');
export default _.times(7, idx => t.add(1, 'day').format('ddd'));
