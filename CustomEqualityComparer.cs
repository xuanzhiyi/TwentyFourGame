using System.Collections.Generic;
using System.Linq;

namespace TwentyFourGame
{
    internal class CustomEqualityComparer : IEqualityComparer<IList<int>>
    {
        public bool Equals(IList<int> x, IList<int> y)
        {
            if (x.Count != y.Count) return false;
            for (int i = 0; i < x.Count; i++)
            {
                if (x[i] != y[i])
                    return false;
            }
            return true;
        }

        // Previously returned only obj.Count which made all same-length lists
        // collide in the hash bucket, defeating deduplication performance.
        public int GetHashCode(IList<int> obj)
        {
            return obj.Aggregate(17, (hash, x) => hash * 31 + x.GetHashCode());
        }
    }
}
