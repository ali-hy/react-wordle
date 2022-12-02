const green = '#42723E';
const yellow = '#A49036';
const grey = '#333';
const light_grey = '#777';

const order = new Map();

order[green] = 3;
order[yellow] = 2;
order[grey] = 1;
order[light_grey] = 0;

function getHigher(a, b) {
  // console.log(b);
  // console.log(order[a], order[b]);
  return order[a] > order[b] ? a : b;
}

export default { light_grey, yellow, grey, green, getHigher };
