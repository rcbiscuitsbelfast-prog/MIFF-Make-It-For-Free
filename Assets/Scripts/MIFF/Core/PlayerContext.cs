using UnityEngine;
using System.Collections.Generic;

namespace MIFF.Core
{
    /// <summary>
    /// Context information about the player using an item
    /// </summary>
    [System.Serializable]
    public class PlayerContext
    {
        public GameObject playerObject;
        public Vector3 playerPosition;
        public bool isInBattle;
        public bool isSoloMode;
        public List<Spirit> playerSpirits;
        public InventoryManager inventory;
        
        public PlayerContext(GameObject player, bool inBattle = false, bool soloMode = false)
        {
            playerObject = player;
            playerPosition = player.transform.position;
            isInBattle = inBattle;
            isSoloMode = soloMode;
            playerSpirits = new List<Spirit>();
            inventory = null;
        }
    }
}