using System.Collections.Generic;

namespace TwentyFourGame
{
    internal class CustomEqualityComparer : IEqualityComparer<IList<int>>
    {
        public bool Equals(IList<int> x, IList<int> y)
        {
            for(int i = 0; i < x.Count; i++)
            {
                if (x[i] != y[i])
                {
                    return false;
                }
            }
            return true;
        }

        public int GetHashCode(IList<int> obj)
        {
            return obj.Count.GetHashCode();
        }
    }
}