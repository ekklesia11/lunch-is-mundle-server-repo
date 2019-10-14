const finalResult = function(obj) {
  let result = Object.entries(obj);
  let rankOne = result.reduce((acc, curr) => {
    if (acc[1] < curr[1]) {
      return (acc = curr);
    } else if (acc[1] >= curr[1]) {
      return acc;
    }
  });
  let sameResult = [];
  if (Object.values(obj).includes(rankOne[1])) {
    for (let value of result) {
      if (rankOne[1] === value[1]) {
        sameResult.push(value[0]);
      }
    }
  } else {
    return rankOne[0];
  }
  return sameResult[Math.round(Math.random() * (sameResult.length - 1))];
};

module.exports = finalResult;
