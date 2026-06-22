import LongestSubstring from "./LongestSubstring";

const tests = [
  { input: "", expected: 0 },
  { input: "a", expected: 1 },
  { input: "bbbbb", expected: 1 },
  { input: "abcd", expected: 4 },
  { input: "abcabcbb", expected: 3 },
  { input: "pwwkew", expected: 3 },
  { input: "dvdf", expected: 3 },
  { input: "abba", expected: 2 },
  { input: "tmmzuxt", expected: 5 },
  { input: "abcbda", expected: 4 },
];

for (const test of tests) {
  const result = new LongestSubstring(test.input).getLongest();
  const ok = result === test.expected;
  console.log(
    `"${test.input}" → ${result} (esperado: ${test.expected}) ${ok ? "ok" : "x"}`,
  );
}
