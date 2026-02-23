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
        enum operators
        {
            plus = 0, minus = 1, times = 2, divide = 3
        }

        public Form1()
        {
            InitializeComponent();
        }

        static List<List<operators>> operatorCombination;

        private void Button1_Click(object sender, EventArgs e)
        {
            operatorCombination = getOperatorCombination();
            List<string> answer = getAnswer(input);
            textBox1.Clear();
            answer.ForEach(p => textBox1.AppendText( p + Environment.NewLine));

        }

        private List<List<operators>> getOperatorCombination()
        {
            List<List<operators>> tmp = new List<List<operators>>();
            for(int i = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    for (int k = 0; k < 4; k++)
                    {
                        tmp.Add(new List<operators> { (operators) i, (operators)j, (operators)k });
                    }
                }
            }
            return tmp;
        }

        private List<string> getAnswer(List<int> input)
        {
            IList<IList<int>> combinations = Permute(input.ToArray()).Distinct(new CustomEqualityComparer()).ToList();

            List<string> answers = new List<string>();

            foreach (List<int> inputset in combinations)
            {
                for (int j = 0; j < operatorCombination.Count; j++)
                {
                    List<operators> operatorSet = operatorCombination[j];
                    float result = evaluateSet(inputset, operatorSet);
                    if (result == 24)
                    {
                        answers.Add(getPrint(inputset, operatorSet) + "=" + result);
                    }
                    else if (result < 24.5 && result > 23.5)
                    {
                        Console.WriteLine(result);
                    }
                    else
                    {
                    }
                }
            }

            return answers;
        }

        private string getPrint(List<int> inputset, List<operators> ops)
        {
            string result = inputset.First().ToString();
            for (int i = 0; i < ops.Count; i++)
            {
                result = "(" + result + getOperator(ops[i]) + inputset.ElementAt(i + 1) + ")";
            }
            return result;
        }

        private string getOperator(operators ops)
        {
            if (ops == operators.divide)
                return " / ";
            else if (ops == operators.minus)
                return " - ";
            else if (ops == operators.plus)
                return " + ";
            else 
                return " x ";
        }

        private float evaluateSet(List<int> inputset, List<operators> ops)
        {
            float result = (float)inputset.First();
            for (int i= 0; i < 3; i++)
            {
                result = evaluate(result, inputset.ElementAt(i + 1), ops[i]);
            }
            return result;
        }

        private float evaluate(float input1, float input2, operators op)
        {
            if (op == operators.plus)
                return input1 + input2;
            else if (op == operators.minus)
                return input1 - input2;
            else if (op == operators.times)
                return input1 * input2;
            else
                return input1 / input2;
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
                // We have one of our possible n! solutions,
                // add it to the list.
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

        private void Button2_Click(object sender, EventArgs e)
        {
            input = new List<int>();
            input.Add(rand.Next(1, 10));
            input.Add(rand.Next(1, 10));
            input.Add(rand.Next(1, 10));
            input.Add(rand.Next(1, 10));
            //input.Add(6);
            //input.Add(5);
            //input.Add(2);
            //input.Add(4);

            label1.Text = input[0] + "";
            label2.Text = input[1] + "";
            label3.Text = input[2] + "";
            label4.Text = input[3] + "";
        }
    }
}
