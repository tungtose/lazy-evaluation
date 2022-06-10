// @types
type Lazy<T> = () => T;


// @func
function add(a: number, b: number) {
  return a + b;
}

function addLazy(a: Lazy<number>, b: Lazy<number>): Lazy<number> {
  return () => a() + b();
}

function getInfinityLoop<T>(): T {
  return getInfinityLoop();
}

// console.log(getInfinityLoop());

function lazyFirst(a: Lazy<number>, b: Lazy<number>): Lazy<number> {
  return () => a();
}

console.log(lazyFirst(() => 3, () => getInfinityLoop())());

// Short-circuit computation
function and(a: Lazy<boolean>, b: Lazy<boolean>): Lazy<boolean> {
  return () => !a() ? false : b();
}

function or(a: Lazy<boolean>, b: Lazy<boolean>): Lazy<boolean> {
  return () => a() ? true : b();
}

// Test Short-circuit computation

console.log("---- Test and: ")
console.log(and(() => true, () => true)());
console.log(and(() => true, () => false)());
console.log(and(() => false, () => true)());
console.log(and(() => false, () => false)());

console.log("---- Test or: ")
console.log(or(() => true, () => true)());
console.log(or(() => true, () => false)());
console.log(or(() => false, () => true)());
console.log(or(() => false, () => false)());


console.log("---- Infinity Data structures:");

// Lazy Linked List:


// @types

type LazyList<T> = Lazy<{
  head: Lazy<T>,
  tail: LazyList<T>
} | null>


function arrToList<T>(arr: T[]): LazyList<T> {
  return () => {
    if (arr.length === 0) return null;

    const [head, ...rest] = arr;

    return {
      head: () => head,
      tail: arrToList(rest)
    }
  }
}

console.log(arrToList([1, 2, 4, 5])()?.head());
console.log(arrToList([1, 2, 4, 5])()?.tail()?.head());
console.log(arrToList([1, 2, 4, 5])()?.tail()?.tail()?.head());

function printList<T>(list: LazyList<T>) {
  let pair = list();
  while (pair !== null) {
    console.log(pair.head());
    pair = pair.tail();
  }
}


console.log("---- with print list:");

printList(arrToList([1, 2, 4, 5]));

function range(begin: Lazy<number>): LazyList<number> {
  return () => {
    let beginRes = begin();
    return {
      head: () => beginRes,
      tail: range(() => beginRes + 1)
    }
  }
}


let memo = [1];

function getFibo(nth: number): number {
  console.log(memo);

  if (nth < 2) return nth;


  if (memo[nth] !== undefined) return memo[nth];

  memo[nth] = getFibo(nth - 1) + getFibo(nth - 2);

  return memo[nth];
}


function take<T>(numLazy: Lazy<number>, list: LazyList<T>): LazyList<T> {
  return () => {
    const num = numLazy();
    const pair = list();
    if (num > 0 && pair !== null) {
      const { head } = pair;
      return {
        head,
        tail: take(() => num - 1, pair?.tail)
      }
    }

    return null;
  }
}

console.log("----- Print take:");
printList(take(() => 10, range(() => 6)));


type Predicate<T> = (value: T) => boolean;

function filter<T>(predicate: Predicate<T>, list: LazyList<T>): LazyList<T> {
  return () => {
    const pair = list();
    if (pair === null) return null;

    const { head, tail } = pair;

    const headValue = head();

    if (!predicate(headValue)) {
      return filter(predicate, tail)();
    }

    return {
      head,
      tail: filter(predicate, tail)
    }
  }
}

const isEven = (num: number) => num % 2 === 0;

const evenNumList = filter(isEven, range(() => 3));


const takeTenElements = <T>(list: LazyList<T>) => take(() => 10, list);


console.log("==== Print 10 even numbers");
printList(takeTenElements(evenNumList));

