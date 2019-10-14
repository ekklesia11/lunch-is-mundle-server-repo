const finalResult = require("./Algorithms");

test("should return a category of the largest count", function() {
  let obj = {
    category1: 1,
    category2: 2,
    category3: 3,
    category4: 4,
    category5: 5,
    category6: 6,
    category7: 7,
    category8: 8
  };
  expect(finalResult(obj)).toBe("category8");
});

test("should return a category randomly if it has the same number of vote", function() {
  let obj = {
    category1: 1,
    category2: 2,
    category3: 3,
    category4: 8,
    category5: 8,
    category6: 8,
    category7: 7,
    category8: 8
  };

  expect(["category4", "category5", "category6", "category8"]).toContain(
    finalResult(obj)
  );
});
