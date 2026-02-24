using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TwentyFourGame
{
    public partial class Form1 : Form
    {
        enum Operator
        {
            Plus = 0, Minus = 1, Times = 2, Divide = 3
        }

        public Form1()
        {
            InitializeComponent();
        }

        static List<List<Operator>> operatorCombination;

        // Calculate button
        private void Button1_Click(object sender, EventArgs e)
        {
            if (input == null)
            {
                MessageBox.Show("Please generate numbers first!", "No Numbers", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            operatorCombination = GetOperatorCombinations();
            List<string> answers = GetAnswer(input);

            textBox1.Clear();
            if (answers.Count == 0)
            {
                textBox1.AppendText("No solution found for these numbers.");
            }
            else
            {
                answers.ForEach(p => textBox1.AppendText(p + Environment.NewLine));
            }
        }

        private List<List<Operator>> GetOperatorCombinations()
        {
            var tmp = new List<List<Operator>>();
            for (int i = 0; i < 4; i++)
                for (int j = 0; j < 4; j++)
                    for (int k = 0; k < 4; k++)
                        tmp.Add(new List<Operator> { (Operator)i, (Operator)j, (Operator)k });
            return tmp;
        }

        private List<string> GetAnswer(List<int> input)
        {
            IList<IList<int>> permutations = Permute(input.ToArray())
                .Distinct(new CustomEqualityComparer())
                .ToList();

            var seen = new HashSet<string>();
            var answers = new List<string>();

            foreach (List<int> nums in permutations)
            {
                foreach (List<Operator> ops in operatorCombination)
                {
                    // Try all 5 valid parenthesizations for 4 numbers
                    foreach (var (expr, val) in EvaluateAllParenthesizations(nums, ops))
                    {
                        if (!float.IsNaN(val) && !float.IsInfinity(val) && Math.Abs(val - 24f) < 1e-6f)
                        {
                            if (seen.Add(expr))
                                answers.Add(expr + " = 24");
                        }
                    }
                }
            }

            return answers;
        }

        // Returns the 5 distinct binary-tree groupings for 4 operands and 3 operators.
        // op1 conceptually sits between nums[0] and nums[1],
        // op2 between nums[1] and nums[2], op3 between nums[2] and nums[3].
        private List<(string expr, float val)> EvaluateAllParenthesizations(
            List<int> nums, List<Operator> ops)
        {
            var results = new List<(string, float)>();

            string a = nums[0].ToString(), b = nums[1].ToString(),
                   c = nums[2].ToString(), d = nums[3].ToString();
            float na = nums[0], nb = nums[1], nc = nums[2], nd = nums[3];

            Operator op1 = ops[0], op2 = ops[1], op3 = ops[2];
            string s1 = OpStr(op1), s2 = OpStr(op2), s3 = OpStr(op3);

            float ab = Eval(na, nb, op1);
            float bc = Eval(nb, nc, op2);
            float cd = Eval(nc, nd, op3);

            // 1. ((a op1 b) op2 c) op3 d
            float abc = Eval(ab, nc, op2);
            results.Add(($"(({a}{s1}{b}){s2}{c}){s3}{d}", Eval(abc, nd, op3)));

            // 2. (a op1 (b op2 c)) op3 d
            float a_bc = Eval(na, bc, op1);
            results.Add(($"({a}{s1}({b}{s2}{c})){s3}{d}", Eval(a_bc, nd, op3)));

            // 3. (a op1 b) op2 (c op3 d)
            results.Add(($"({a}{s1}{b}){s2}({c}{s3}{d})", Eval(ab, cd, op2)));

            // 4. a op1 ((b op2 c) op3 d)
            float bc_d = Eval(bc, nd, op3);
            results.Add(($"{a}{s1}(({b}{s2}{c}){s3}{d})", Eval(na, bc_d, op1)));

            // 5. a op1 (b op2 (c op3 d))
            float b_cd = Eval(nb, cd, op2);
            results.Add(($"{a}{s1}({b}{s2}({c}{s3}{d}))", Eval(na, b_cd, op1)));

            return results;
        }

        private string OpStr(Operator op)
        {
            switch (op)
            {
                case Operator.Plus:   return " + ";
                case Operator.Minus:  return " - ";
                case Operator.Times:  return " × ";
                case Operator.Divide: return " ÷ ";
                default:              return "?";
            }
        }

        private float Eval(float a, float b, Operator op)
        {
            switch (op)
            {
                case Operator.Plus:   return a + b;
                case Operator.Minus:  return a - b;
                case Operator.Times:  return a * b;
                case Operator.Divide: return b == 0f ? float.NaN : a / b;
                default:              return float.NaN;
            }
        }

        static IList<IList<int>> Permute(int[] nums)
        {
            var list = new List<IList<int>>();
            return DoPermute(nums, 0, nums.Length - 1, list);
        }

        static IList<IList<int>> DoPermute(int[] nums, int start, int end, IList<IList<int>> list)
        {
            if (start == end)
            {
                list.Add(new List<int>(nums));
            }
            else
            {
                for (var i = start; i <= end; i++)
                {
                    Swap(ref nums[start], ref nums[i]);
                    DoPermute(nums, start + 1, end, list);
                    Swap(ref nums[start], ref nums[i]);
                }
            }
            return list;
        }

        static void Swap(ref int a, ref int b)
        {
            var temp = a;
            a = b;
            b = temp;
        }

        Random rand = new Random();
        List<int> input;

        // Generate button
        private void Button2_Click(object sender, EventArgs e)
        {
            input = new List<int>
            {
                rand.Next(1, 11),
                rand.Next(1, 11),
                rand.Next(1, 11),
                rand.Next(1, 11)
            };

            label1.Text = input[0].ToString();
            label2.Text = input[1].ToString();
            label3.Text = input[2].ToString();
            label4.Text = input[3].ToString();

            textBox1.Clear();
        }
    }
}
