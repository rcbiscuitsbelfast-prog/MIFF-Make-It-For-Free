using NewBark.DialogTrees;
using UnityEngine;

namespace NewBark.Dialog
{
    // Attach to NPC with a 2D collider; integrates with InteractionController via SendMessage("OnPlayerInteract")
    public class DialogTreeStarter : MonoBehaviour
    {
        public DialogTree dialogTree;
        public string startNodeID = "start";

        private void OnPlayerInteract()
        {
            if (dialogTree == null) return;
            GameManager.Dialog.StartDialogTree(dialogTree, startNodeID);
        }
    }
}

