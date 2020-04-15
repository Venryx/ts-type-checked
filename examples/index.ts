// In your project this would become
//
// import { typeCheckFor } from 'ts-type-checked';
import { typeCheckFor } from '..';

interface User {
  name: string;
  age: number;
  hobbies?: string[];
}

const isAString = typeCheckFor<string>();
const isANumber = typeCheckFor<number>();
const isAUser = typeCheckFor<User>();

[
  1,
  true,
  undefined,
  null,
  'Hello World!',
  { name: 'Joe', age: 8 },
  { name: 'John', age: 'None' },
  { name: 'Dough', age: 6, hobbies: 'none' },
  { name: 'Jan', age: 30, hobbies: ['gardening', 'coding'] },
].forEach(value => {
  console.log(JSON.stringify(value));
  console.log('\tIs a string:\t%s', isAString(value));
  console.log('\tIs a number:\t%s', isANumber(value));
  console.log('\tIs a User:\t%s', isAUser(value));
});
