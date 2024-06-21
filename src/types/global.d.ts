import {type EIP1193Provider} from './eip1193.ts'

// declare global {
//   interface Window {
//     ethereum?: EIP1193Provider
//   }
// }

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}
