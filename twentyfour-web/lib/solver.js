'use strict';

const OPS = ['+', '-', '×', '÷'];

function evalOp(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b === 0 ? NaN : a / b;
  return NaN;
}

function permutations(arr) {
  const result = [];
  function permute(start) {
    if (start === arr.length - 1) {
      result.push([...arr]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      permute(start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  }
  permute(0);
  return result;
}

function deduplicatePermutations(perms) {
  const seen = new Set();
  return perms.filter(p => {
    const key = p.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function operatorCombinations() {
  const combos = [];
  for (const op1 of OPS)
    for (const op2 of OPS)
      for (const op3 of OPS)
        combos.push([op1, op2, op3]);
  return combos;
}

// Canonical form for a binary sub-expression: commutative ops sort operands so
// e.g. (3+5) and (5+3) both become "(3+5)", collapsing duplicates.
function canonNode(left, right, op) {
  if (op === '+' || op === '×') {
    const [l, r] = left <= right ? [left, right] : [right, left];
    return `(${l}${op}${r})`;
  }
  return `(${left}${op}${right})`;
}

// All 5 Catalan binary-tree groupings for 4 operands.
// op positions are fixed: op1 between nums[0]&[1], op2 between [1]&[2], op3 between [2]&[3].
function evaluateAllParenthesizations(nums, ops) {
  const [na, nb, nc, nd] = nums;
  const [op1, op2, op3] = ops;
  const [a, b, c, d] = nums.map(String);
  const [s1, s2, s3] = ops;

  const ab = evalOp(na, nb, op1);
  const bc = evalOp(nb, nc, op2);
  const cd = evalOp(nc, nd, op3);

  // Canonical leaf nodes and pairwise sub-expressions
  const k_ab = canonNode(a, b, s1);
  const k_bc = canonNode(b, c, s2);
  const k_cd = canonNode(c, d, s3);

  return [
    // 1. ((a op1 b) op2 c) op3 d
    { expr: `((${a}${s1}${b})${s2}${c})${s3}${d}`,
      key: canonNode(canonNode(k_ab, c, s2), d, s3),
      val: evalOp(evalOp(ab, nc, op2), nd, op3) },
    // 2. (a op1 (b op2 c)) op3 d
    { expr: `(${a}${s1}(${b}${s2}${c}))${s3}${d}`,
      key: canonNode(canonNode(a, k_bc, s1), d, s3),
      val: evalOp(evalOp(na, bc, op1), nd, op3) },
    // 3. (a op1 b) op2 (c op3 d)
    { expr: `(${a}${s1}${b})${s2}(${c}${s3}${d})`,
      key: canonNode(k_ab, k_cd, s2),
      val: evalOp(ab, cd, op2) },
    // 4. a op1 ((b op2 c) op3 d)
    { expr: `${a}${s1}((${b}${s2}${c})${s3}${d})`,
      key: canonNode(a, canonNode(k_bc, d, s3), s1),
      val: evalOp(na, evalOp(bc, nd, op3), op1) },
    // 5. a op1 (b op2 (c op3 d))
    { expr: `${a}${s1}(${b}${s2}(${c}${s3}${d}))`,
      key: canonNode(a, canonNode(b, k_cd, s2), s1),
      val: evalOp(na, evalOp(nb, cd, op2), op1) },
  ];
}

/**
 * @param {number[]} numbers  4 integers in [1,10]
 * @returns {string[]}        All unique solutions, e.g. "((3+1)×6)÷1 = 24"
 */
function solve(numbers) {
  const perms = deduplicatePermutations(permutations([...numbers]));
  const opCombos = operatorCombinations();
  const seen = new Set();
  const solutions = [];

  for (const nums of perms) {
    for (const ops of opCombos) {
      for (const { expr, key, val } of evaluateAllParenthesizations(nums, ops)) {
        if (!isNaN(val) && isFinite(val) && Math.abs(val - 24) < 1e-6) {
          if (!seen.has(key)) {
            seen.add(key);
            solutions.push(`${expr} = 24`);
          }
        }
      }
    }
  }

  return solutions;
}

module.exports = { solve };
