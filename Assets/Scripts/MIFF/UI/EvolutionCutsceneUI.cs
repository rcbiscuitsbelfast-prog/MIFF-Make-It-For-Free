using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;
using TMPro;
using System.Collections;
using MIFF.Spirits;
using MIFF.Evolution;

namespace MIFF.UI
{
    /// <summary>
    /// UI component for displaying evolution cutscenes
    /// </summary>
    public class EvolutionCutsceneUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject cutscenePanel;
        [SerializeField] private Image beforeSprite;
        [SerializeField] private Image afterSprite;
        [SerializeField] private TextMeshProUGUI loreText;
        [SerializeField] private Button continueButton;
        [SerializeField] private Button skipButton;
        
        [Header("Tutorial Overlay")]
        [SerializeField] private GameObject tutorialOverlay;
        [SerializeField] private TextMeshProUGUI tutorialText;
        [SerializeField] private Button spiritDexButton;
        [SerializeField] private Button closeTutorialButton;
        
        [Header("Animation")]
        [SerializeField] private float morphDuration = 2.0f;
        [SerializeField] private float fadeInDuration = 0.5f;
        [SerializeField] private float fadeOutDuration = 0.5f;
        [SerializeField] private AnimationCurve morphCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);
        
        [Header("Audio")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip evolutionSFX;
        [SerializeField] private AudioClip evolutionMusic;
        
        [Header("Visual Effects")]
        [SerializeField] private ParticleSystem evolutionParticles;
        [SerializeField] private Color evolutionColor = Color.white;
        [SerializeField] private float evolutionDuration = 3.0f;
        [SerializeField] private bool showParticles = true;
        
        [Header("Events")]
        [SerializeField] private UnityEvent onEvolutionCutsceneStarted;
        [SerializeField] private UnityEvent onEvolutionCutsceneCompleted;
        [SerializeField] private UnityEvent onEvolutionCutsceneSkipped;
        [SerializeField] private UnityEvent onSpiritDexRequested;
        
        private SpiritInstance currentSpirit;
        private SpiritEvolution_SO currentEvolution;
        private bool isCutsceneActive = false;
        private Coroutine morphCoroutine;
        private bool isFirstEvolution = false;
        
        private void Start()
        {
            if (continueButton != null)
                continueButton.onClick.AddListener(OnContinueClicked);
            
            if (skipButton != null)
                skipButton.onClick.AddListener(OnSkipClicked);
            
            if (spiritDexButton != null)
                spiritDexButton.onClick.AddListener(OnSpiritDexClicked);
            
            if (closeTutorialButton != null)
                closeTutorialButton.onClick.AddListener(OnCloseTutorialClicked);
            
            // Hide panels initially
            if (cutscenePanel != null)
                cutscenePanel.SetActive(false);
            
            if (tutorialOverlay != null)
                tutorialOverlay.SetActive(false);
        }
        
        /// <summary>
        /// Show the evolution cutscene
        /// </summary>
        public void ShowEvolution(SpiritInstance spirit, SpiritEvolution_SO evolution)
        {
            if (isCutsceneActive || spirit == null || evolution == null) return;
            
            currentSpirit = spirit;
            currentEvolution = evolution;
            isCutsceneActive = true;
            
            // Check if this is the first evolution
            var flagManager = MIFF.Core.OnboardingFlagManager.Instance;
            isFirstEvolution = flagManager == null || !flagManager.GetFlag("FirstEvolutionSeen");
            
            // Show the panel
            if (cutscenePanel != null)
                cutscenePanel.SetActive(true);
            
            // Start the cutscene
            StartCoroutine(PlayEvolutionCutscene());
            
            onEvolutionCutsceneStarted?.Invoke();
        }
        
        /// <summary>
        /// Play the evolution cutscene sequence
        /// </summary>
        private IEnumerator PlayEvolutionCutscene()
        {
            // Setup initial state
            SetupCutscene();
            
            // Fade in
            yield return StartCoroutine(FadeIn());
            
            // Play evolution SFX
            PlayEvolutionAudio();
            
            // Start particle effects
            StartParticleEffects();
            
            // Wait a moment before morphing
            yield return new WaitForSeconds(0.5f);
            
            // Morph animation
            yield return StartCoroutine(MorphAnimation());
            
            // Show final state
            ShowFinalState();
            
            // Wait for player input
            yield return new WaitUntil(() => Input.GetKeyDown(KeyCode.Space) || Input.GetMouseButtonDown(0));
            
            // Show tutorial overlay for first evolution
            if (isFirstEvolution)
            {
                ShowTutorialOverlay();
                yield return new WaitUntil(() => !tutorialOverlay.activeSelf);
            }
            
            // Fade out
            yield return StartCoroutine(FadeOut());
            
            // Complete cutscene
            CompleteCutscene();
        }
        
        /// <summary>
        /// Setup the cutscene with initial state
        /// </summary>
        private void SetupCutscene()
        {
            if (currentSpirit == null || currentEvolution == null) return;
            
            // Set before sprite (current spirit)
            if (beforeSprite != null)
            {
                // This would integrate with your sprite system
                // beforeSprite.sprite = GetSpiritSprite(currentSpirit.SpeciesID);
                beforeSprite.color = Color.white;
            }
            
            // Hide after sprite initially
            if (afterSprite != null)
            {
                afterSprite.color = new Color(1, 1, 1, 0);
            }
            
            // Set lore text
            if (loreText != null)
            {
                loreText.text = currentEvolution.EvolutionLoreText;
            }
            
            // Disable continue button until cutscene completes
            if (continueButton != null)
                continueButton.interactable = false;
        }
        
        /// <summary>
        /// Show tutorial overlay for first evolution
        /// </summary>
        private void ShowTutorialOverlay()
        {
            if (tutorialOverlay == null) return;
            
            // Set tutorial text
            if (tutorialText != null)
            {
                tutorialText.text = "Your bond and skill have unlocked a new form. " +
                                   "Evolutions can happen through battles, quests, or special items — discover them all!";
            }
            
            // Show the overlay
            tutorialOverlay.SetActive(true);
            
            // Highlight the SpiritDex button
            if (spiritDexButton != null)
            {
                StartCoroutine(PulseButton(spiritDexButton));
            }
        }
        
        /// <summary>
        /// Pulse button to draw attention
        /// </summary>
        private IEnumerator PulseButton(Button button)
        {
            var originalScale = button.transform.localScale;
            var pulseScale = originalScale * 1.2f;
            
            while (tutorialOverlay.activeSelf)
            {
                // Pulse up
                float elapsed = 0f;
                while (elapsed < 0.5f)
                {
                    elapsed += Time.deltaTime;
                    float progress = elapsed / 0.5f;
                    button.transform.localScale = Vector3.Lerp(originalScale, pulseScale, progress);
                    yield return null;
                }
                
                // Pulse down
                elapsed = 0f;
                while (elapsed < 0.5f)
                {
                    elapsed += Time.deltaTime;
                    float progress = elapsed / 0.5f;
                    button.transform.localScale = Vector3.Lerp(pulseScale, originalScale, progress);
                    yield return null;
                }
            }
            
            // Reset scale
            button.transform.localScale = originalScale;
        }
        
        /// <summary>
        /// Handle SpiritDex button click
        /// </summary>
        private void OnSpiritDexClicked()
        {
            Debug.Log("SpiritDex requested!");
            onSpiritDexRequested?.Invoke();
            
            // Hide tutorial overlay
            if (tutorialOverlay != null)
                tutorialOverlay.SetActive(false);
        }
        
        /// <summary>
        /// Handle close tutorial button click
        /// </summary>
        private void OnCloseTutorialClicked()
        {
            if (tutorialOverlay != null)
                tutorialOverlay.SetActive(false);
        }
        
        /// <summary>
        /// Play evolution audio
        /// </summary>
        private void PlayEvolutionAudio()
        {
            if (audioSource == null) return;
            
            // Play SFX
            if (evolutionSFX != null)
            {
                audioSource.PlayOneShot(evolutionSFX);
            }
            
            // Play music (if different from current)
            if (evolutionMusic != null)
            {
                // This would integrate with your music system
                // audioSource.clip = evolutionMusic;
                // audioSource.Play();
            }
        }
        
        /// <summary>
        /// Start particle effects
        /// </summary>
        private void StartParticleEffects()
        {
            if (evolutionParticles != null)
            {
                evolutionParticles.Play();
            }
        }
        
        /// <summary>
        /// Play the morph animation
        /// </summary>
        private IEnumerator MorphAnimation()
        {
            if (beforeSprite == null || afterSprite == null) yield break;
            
            float elapsed = 0f;
            
            while (elapsed < morphDuration)
            {
                elapsed += Time.deltaTime;
                float progress = elapsed / morphDuration;
                float curveValue = morphCurve.Evaluate(progress);
                
                // Morph between sprites
                beforeSprite.color = new Color(1, 1, 1, 1 - curveValue);
                afterSprite.color = new Color(1, 1, 1, curveValue);
                
                // Add glow effect
                if (afterSprite != null)
                {
                    afterSprite.color = Color.Lerp(Color.white, evolutionColor, curveValue * 1.5f);
                }
                
                yield return null;
            }
            
            // Ensure final state
            if (beforeSprite != null)
                beforeSprite.color = new Color(1, 1, 1, 0);
            if (afterSprite != null)
                afterSprite.color = Color.white;
        }
        
        /// <summary>
        /// Show the final evolved state
        /// </summary>
        private void ShowFinalState()
        {
            if (currentEvolution?.EvolvedSpiritSpecies == null) return;
            
            // Set evolved sprite
            if (afterSprite != null)
            {
                // This would integrate with your sprite system
                // afterSprite.sprite = GetSpiritSprite(currentEvolution.EvolvedSpiritSpecies.SpeciesID);
                afterSprite.color = Color.white;
            }
            
            // Enable continue button
            if (continueButton != null)
                continueButton.interactable = true;
        }
        
        /// <summary>
        /// Fade in animation
        /// </summary>
        private IEnumerator FadeIn()
        {
            if (cutscenePanel == null) yield break;
            
            var canvasGroup = cutscenePanel.GetComponent<CanvasGroup>();
            if (canvasGroup == null) yield break;
            
            canvasGroup.alpha = 0f;
            float elapsed = 0f;
            
            while (elapsed < fadeInDuration)
            {
                elapsed += Time.deltaTime;
                canvasGroup.alpha = Mathf.Lerp(0f, 1f, elapsed / fadeInDuration);
                yield return null;
            }
            
            canvasGroup.alpha = 1f;
        }
        
        /// <summary>
        /// Fade out animation
        /// </summary>
        private IEnumerator FadeOut()
        {
            if (cutscenePanel == null) yield break;
            
            var canvasGroup = cutscenePanel.GetComponent<CanvasGroup>();
            if (canvasGroup == null) yield break;
            
            float elapsed = 0f;
            
            while (elapsed < fadeOutDuration)
            {
                elapsed += Time.deltaTime;
                canvasGroup.alpha = Mathf.Lerp(1f, 0f, elapsed / fadeOutDuration);
                yield return null;
            }
            
            canvasGroup.alpha = 0f;
        }
        
        /// <summary>
        /// Complete the cutscene
        /// </summary>
        private void CompleteCutscene()
        {
            isCutsceneActive = false;
            
            // Stop particle effects
            if (evolutionParticles != null)
            {
                evolutionParticles.Stop();
            }
            
            // Hide panels
            if (cutscenePanel != null)
                cutscenePanel.SetActive(false);
            
            if (tutorialOverlay != null)
                tutorialOverlay.SetActive(false);
            
            // Set first evolution flag
            if (isFirstEvolution)
            {
                var flagManager = MIFF.Core.OnboardingFlagManager.Instance;
                if (flagManager != null)
                {
                    flagManager.SetFlag("FirstEvolutionSeen", true);
                }
            }
            
            // Clear references
            currentSpirit = null;
            currentEvolution = null;
            
            onEvolutionCutsceneCompleted?.Invoke();
        }
        
        /// <summary>
        /// Handle continue button click
        /// </summary>
        private void OnContinueClicked()
        {
            if (isCutsceneActive)
            {
                // Skip to end of cutscene
                if (morphCoroutine != null)
                {
                    StopCoroutine(morphCoroutine);
                }
                
                CompleteCutscene();
            }
        }
        
        /// <summary>
        /// Handle skip button click
        /// </summary>
        private void OnSkipClicked()
        {
            if (isCutsceneActive)
            {
                // Stop cutscene immediately
                if (morphCoroutine != null)
                {
                    StopCoroutine(morphCoroutine);
                }
                
                CompleteCutscene();
                onEvolutionCutsceneSkipped?.Invoke();
            }
        }
        
        /// <summary>
        /// Check if cutscene is currently active
        /// </summary>
        public bool IsCutsceneActive => isCutsceneActive;
        
        /// <summary>
        /// Force show evolution cutscene (for testing)
        /// </summary>
        [ContextMenu("Force Show Evolution")]
        public void ForceShowEvolution()
        {
            // Create test data
            var testSpirit = new SpiritInstance("test_spirit", "Test Spirit");
            var testEvolution = ScriptableObject.CreateInstance<SpiritEvolution_SO>();
            
            ShowEvolution(testSpirit, testEvolution);
        }
        
        /// <summary>
        /// Force hide evolution cutscene (for testing)
        /// </summary>
        [ContextMenu("Force Hide Evolution")]
        public void ForceHideEvolution()
        {
            if (isCutsceneActive)
            {
                CompleteCutscene();
            }
        }
        
        /// <summary>
        /// Test tutorial overlay (for testing)
        /// </summary>
        [ContextMenu("Test Tutorial Overlay")]
        public void TestTutorialOverlay()
        {
            if (tutorialOverlay != null)
            {
                tutorialOverlay.SetActive(true);
            }
        }
        
        /// <summary>
        /// Get spirit sprite (placeholder for integration)
        /// </summary>
        private Sprite GetSpiritSprite(string speciesID)
        {
            // This would integrate with your sprite system
            // For now, return null
            return null;
        }
    }
}