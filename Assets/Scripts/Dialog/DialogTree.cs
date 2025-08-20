using UnityEngine;

namespace NewBark.DialogTrees
{
    [CreateAssetMenu(fileName = "New_DialogTree", menuName = "Remix/Dialogs/Dialog Tree", order = 0)]
    public class DialogTree : ScriptableObject
    {
        public string treeID;
        public DialogNode[] nodes;
    }
}

