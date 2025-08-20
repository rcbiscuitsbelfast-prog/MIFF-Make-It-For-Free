using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;
using TMPro;
using MIFF.Tutorials;

namespace MIFF.UI
{
    /// <summary>
    /// UI component for the item usage tutorial
    /// </summary>
    public class ItemUsageTutorialUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject tutorialPanel;
        [SerializeField] private Image bagButtonImage;
        [SerializeField] private TextMeshProUGUI tutorialText;
        [SerializeField] private Button continueButton;
        [SerializeField] private Button skipButton;
        
        [Header("Tutorial Content")]
        [SerializeField] private string overworldText = "You can use items to heal or buff your spirits. Try opening your Bag!";
        [SerializeField] private string battleText = "In battle, you can use items to help your spirits. Open your Bag to see what's available!";
        
        [Header("Visual")]
        [SerializeField] private Sprite bagButtonSprite;
        [SerializeField] private Color highlightColor = Color.yellow;
        [SerializeField] private float pulseSpeed = 2.0f;
        
        [Header("Events")]
        [SerializeField] private UnityEvent onTutorialShown;
        [SerializeField] private UnityEvent onTutorialContinued;
        [SerializeField] private UnityEvent onTutorialSkipped;
        
        private TutorialTrigger_ItemUsage tutorialTrigger;
        private bool isVisible = false;
        private Vector3 originalBagButtonScale;
        private Color originalBagButtonColor;
        
        private void Start()
        {
            if (continueButton != null)
                continueButton.onClick.AddListener(OnContinueClicked);
            
            if (skipButton != null)
                skipButton.onClick.AddListener(OnSkipClicked);
            
            // Find tutorial trigger
            tutorialTrigger = FindObjectOfType<TutorialTrigger_ItemUsage>();
            
            // Hide panel initially
            if (tutorialPanel != null)
                tutorialPanel.SetActive(false);
            
            // Store original bag button properties
            if (bagButtonImage != null)
            {
                originalBagButtonScale = bagButtonImage.transform.localScale;
                originalBagButtonColor = bagButtonImage.color;
            }
        }
        
        /// <summary>
        /// Show the tutorial with the given context
        /// </summary>
        public void ShowTutorial(TutorialContext context)
        {
            if (isVisible) return;
            
            isVisible = true;
            
            // Update tutorial text based on context
            UpdateTutorialText(context);
            
            // Update bag button image
            UpdateBagButtonImage();
            
            // Show the panel
            if (tutorialPanel != null)
                tutorialPanel.SetActive(true);
            
            // Start highlighting animation
            StartHighlighting();
            
            onTutorialShown?.Invoke();
            
            Debug.Log($"Showing item usage tutorial for context: {context}");
        }
        
        /// <summary>
        /// Hide the tutorial
        /// </summary>
        public void HideTutorial()
        {
            if (!isVisible) return;
            
            isVisible = false;
            
            // Stop highlighting
            StopHighlighting();
            
            // Hide the panel
            if (tutorialPanel != null)
                tutorialPanel.SetActive(false);
            
            Debug.Log("Hiding item usage tutorial");
        }
        
        /// <summary>
        /// Update tutorial text based on context
        /// </summary>
        private void UpdateTutorialText(TutorialContext context)
        {
            if (tutorialText == null) return;
            
            switch (context)
            {
                case TutorialContext.Battle:
                    tutorialText.text = battleText;
                    break;
                case TutorialContext.Overworld:
                default:
                    tutorialText.text = overworldText;
                    break;
            }
        }
        
        /// <summary>
        /// Update the bag button image
        /// </summary>
        private void UpdateBagButtonImage()
        {
            if (bagButtonImage == null) return;
            
            if (bagButtonSprite != null)
            {
                bagButtonImage.sprite = bagButtonSprite;
            }
            
            // You could also load this dynamically from your UI system
            // bagButtonImage.sprite = FindObjectOfType<InventoryButton>()?.GetComponent<Image>()?.sprite;
        }
        
        /// <summary>
        /// Start highlighting the bag button
        /// </summary>
        private void StartHighlighting()
        {
            if (bagButtonImage == null) return;
            
            // Start pulsing animation
            InvokeRepeating(nameof(PulseBagButton), 0f, 0.1f);
        }
        
        /// <summary>
        /// Stop highlighting the bag button
        /// </summary>
        private void StopHighlighting()
        {
            if (bagButtonImage == null) return;
            
            // Stop pulsing
            CancelInvoke(nameof(PulseBagButton));
            
            // Restore original appearance
            bagButtonImage.transform.localScale = originalBagButtonScale;
            bagButtonImage.color = originalBagButtonColor;
        }
        
        /// <summary>
        /// Pulse the bag button for highlighting
        /// </summary>
        private void PulseBagButton()
        {
            if (bagButtonImage == null) return;
            
            float pulse = Mathf.Sin(Time.time * pulseSpeed) * 0.1f + 1.0f;
            bagButtonImage.transform.localScale = originalBagButtonScale * pulse;
            
            // Alternate color
            float colorPulse = Mathf.Sin(Time.time * pulseSpeed * 2) * 0.5f + 0.5f;
            bagButtonImage.color = Color.Lerp(originalBagButtonColor, highlightColor, colorPulse);
        }
        
        /// <summary>
        /// Handle continue button click
        /// </summary>
        private void OnContinueClicked()
        {
            if (tutorialTrigger != null)
            {
                tutorialTrigger.CompleteTutorial();
            }
            
            HideTutorial();
            onTutorialContinued?.Invoke();
        }
        
        /// <summary>
        /// Handle skip button click
        /// </summary>
        private void OnSkipClicked()
        {
            if (tutorialTrigger != null)
            {
                tutorialTrigger.SkipTutorial();
            }
            
            HideTutorial();
            onTutorialSkipped?.Invoke();
        }
        
        /// <summary>
        /// Set tutorial text content
        /// </summary>
        public void SetTutorialText(string overworld, string battle)
        {
            overworldText = overworld;
            battleText = battle;
            
            // Update current text if tutorial is visible
            if (isVisible)
            {
                var currentContext = TutorialContext.Overworld; // Default
                UpdateTutorialText(currentContext);
            }
        }
        
        /// <summary>
        /// Set bag button sprite
        /// </summary>
        public void SetBagButtonSprite(Sprite sprite)
        {
            bagButtonSprite = sprite;
            
            if (bagButtonImage != null && sprite != null)
            {
                bagButtonImage.sprite = sprite;
            }
        }
        
        /// <summary>
        /// Check if tutorial is currently visible
        /// </summary>
        public bool IsVisible => isVisible;
        
        /// <summary>
        /// Force show tutorial (for testing)
        /// </summary>
        [ContextMenu("Force Show Tutorial")]
        public void ForceShowTutorial()
        {
            ShowTutorial(TutorialContext.Overworld);
        }
        
        /// <summary>
        /// Force hide tutorial (for testing)
        /// </summary>
        [ContextMenu("Force Hide Tutorial")]
        public void ForceHideTutorial()
        {
            HideTutorial();
        }
    }
}