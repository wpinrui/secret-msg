# secret-msg

An applet that teaches matrix multiplication through a Hill-style cipher.

## Encrypt

1. Type a message of up to 20 letters and spaces.
2. Each character becomes a number: space = 0, a = 1, ..., z = 26.
3. The numbers fill a 2 by k matrix T, column by column. An odd-length message gets a trailing space.
4. Pick a key E: a 2 by 2 matrix of whole numbers from 0 to 99 with det E ≠ 0. The random key always has det E = ±1, so the decryption key D = E⁻¹ has whole-number entries.
5. The ciphertext is C = ET.

## Decrypt

- **With D:** T = DC, then read the numbers back as letters. D accepts fractions such as `3/7`.
- **Without D:** the crack tries every E with entries from 0 to 99 (10⁸ keys). It keeps each E for which E⁻¹C comes out as whole numbers from 0 to 26. It then ranks the distinct messages by the share of their letters that a dictionary split can cover, and shows the top 10 with T and every E and D that produce each one.

## Develop

```sh
yarn
yarn dev
yarn test
yarn typecheck
yarn lint
```

## Credits

The dictionary is [google-10000-english](https://github.com/first20hours/google-10000-english) (USA, no swears), which is licensed for educational and personal use only.
