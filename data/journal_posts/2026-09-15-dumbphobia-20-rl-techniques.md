---
title: "DumbPhobia#020: The Evolution of Reinforcement Learning"
date: 2026-09-15
tags: [system-design]
image: /assets/post-covers/rl.png
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

Reinforcement Learning has evolved from relatively simple tabular algorithms into systems that combine deep neural networks, generative models, large offline datasets, learned environment models, and sequence modeling. Modern RL is therefore better understood as a collection of techniques rather than a single family of algorithms. This article follows the major techniques approximately from oldest to newest, explaining the problem each technique attempted to solve and how later methods built upon earlier ones.

## Reinforcement Learning in One Equation

An RL agent repeatedly observes a state $s_t$, chooses an action $a_t$, receives a reward $r_t$, and transitions to another state $s_{t+1}$:

$$
s_t \rightarrow a_t \rightarrow r_t \rightarrow s_{t+1}
$$

The objective is to maximize expected discounted return:

$$
G_t = \sum_{k=0}^{\infty}\gamma^k r_{t+k}
$$

where $\gamma$ is the discount factor. Most reinforcement-learning techniques differ primarily in what they learn, how they estimate which actions are good, and how they use collected experience.

| Period      | Technique                   | Main idea                                                |
| ----------- | --------------------------- | -------------------------------------------------------- |
| 1989–1992   | Q-Learning                  | Learn action values                                      |
| 1992        | REINFORCE                   | Directly optimize the policy                             |
| 1990s–2000s | Actor-Critic                | Learn policy and value simultaneously                    |
| 2015        | DQN                         | Combine Q-learning with deep networks                    |
| 2015        | TRPO                        | Constrain policy updates                                 |
| 2015        | GAE                         | Improve advantage estimation                             |
| 2015        | DDPG                        | Actor-critic for continuous actions                      |
| 2017        | PPO                         | Simplify stable policy optimization                      |
| 2018        | TD3                         | Reduce instability in deterministic actor-critic         |
| 2018        | SAC                         | Maximum-entropy actor-critic                             |
| 2020        | CQL                         | Conservative offline RL                                  |
| 2020+       | World-Model RL              | Learn environment dynamics                               |
| 2021        | Decision Transformer        | Treat RL as sequence modeling                            |
| 2021        | IQL                         | Offline RL without evaluating unseen actions             |
| 2023        | DreamerV3                   | General-purpose world-model RL                           |
| 2023        | Diffusion Policy            | Generate multimodal action sequences                     |
| 2024–2026   | World Model + Generative RL | Optimize generative policies inside learned environments |

## 1. Q-Learning — 1989

Q-learning is one of the foundational model-free reinforcement-learning algorithms. Instead of learning the environment dynamics, the agent learns an action-value function $Q(s,a)$, which estimates the expected future return obtained by taking action $a$ in state $s$.

$$
Q(s_t,a_t) \leftarrow Q(s_t,a_t) + \alpha \left[r_t + \gamma\max_a Q(s_{t+1},a) - Q(s_t,a_t)\right]
$$

The quantity $r_t+\gamma\max_aQ(s_{t+1},a)$ acts as the learning target, and once $Q$ is learned the agent typically selects the action with the highest estimated value:

$$
a_t = \arg\max_a Q(s_t,a)
$$

The main contribution of Q-learning was showing that an agent could learn optimal behavior without explicitly knowing the environment transition model $P(s_{t+1}|s_t,a_t)$. Its main limitation is that tabular Q-learning requires storing values for every relevant state-action pair, which quickly becomes impossible when the state space is large or continuous.

## 2. REINFORCE — 1992

REINFORCE introduced a different approach: instead of learning a value function and deriving a policy from it, directly optimize a parameterized policy $\pi_\theta(a|s)$. Its policy-gradient estimator is:

$$
\nabla_\theta J(\theta) = \mathbb E\left[G_t\nabla_\theta\log\pi_\theta(a_t|s_t)\right]
$$

The intuition is that actions associated with high return should become more probable, while actions associated with low return should become less probable. Policy gradients naturally support stochastic policies and continuous action spaces, but the Monte Carlo return $G_t$ can have very high variance, making training unstable. This problem motivated baselines, learned value functions, advantage estimation, and actor-critic methods.

## 3. Actor-Critic Methods — 1990s–2000s

Actor-critic methods combine two learned components. The actor represents the policy $\pi_\theta(a|s)$, while the critic estimates either a state value $V_\phi(s)$ or an action value $Q_\phi(s,a)$. Instead of updating the policy using only noisy Monte Carlo return, the actor can use an advantage estimate:

$$
A(s_t,a_t)=Q(s_t,a_t)-V(s_t)
$$

This greatly reduces policy-gradient variance. Actor-critic became one of the most important architectural patterns in modern RL and forms the foundation of algorithms such as A2C, A3C, DDPG, PPO, TD3, and SAC.

## 4. Deep Q-Network — 2015

Deep Q-Network, or DQN, replaced the Q-table with a neural network:

$$
Q_\theta(s,a)
$$

This made Q-learning applicable to high-dimensional observations such as images. Instead of looking up a state in a table, the network receives the state as input and outputs estimated Q-values for each available action.

DQN introduced two particularly important stabilization techniques. The first is experience replay, where transitions $(s_t,a_t,r_t,s_{t+1})$ are stored in a replay buffer and randomly sampled during training to reduce correlation between consecutive observations. The second is a target network, which is updated more slowly than the main network and is used to construct more stable targets:

$$
y_t = r_t + \gamma\max_aQ_{\theta^-}(s_{t+1},a)
$$

DQN was a major breakthrough for deep reinforcement learning, but it is naturally suited to discrete action spaces, so continuous-control problems required different approaches.

## 5. Trust Region Policy Optimization — 2015

Policy-gradient methods can fail when the policy changes too much after a single update. TRPO addressed this by constraining the new policy to remain close to the old one using KL divergence:

$$
D_{KL}\left(\pi_{\text{old}}\|\pi_{\text{new}}\right)\leq\delta
$$

Its objective is approximately:

$$
\max_\theta \mathbb E\left[\frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{\text{old}}}(a_t|s_t)}A_t\right]
$$

subject to that trust-region constraint. The main idea was simple and influential: improve the policy while preventing destructive updates. The main weakness was computational complexity, because TRPO relies on constrained second-order optimization. This directly motivated PPO.

## 6. Generalized Advantage Estimation — 2015

GAE is not a complete reinforcement-learning algorithm; it is an advantage-estimation technique commonly used inside actor-critic methods. It begins with the temporal-difference residual:

$$
\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)
$$

Then it combines future residuals:

$$
\hat A_t^{GAE} = \sum_{l=0}^{\infty}(\gamma\lambda)^l\delta_{t+l}
$$

The parameter $\lambda$ controls the bias-variance tradeoff. When $\lambda=0$, GAE behaves mostly like a one-step TD estimator with lower variance but higher bias; when $\lambda$ approaches $1$, it becomes more similar to a long-horizon Monte Carlo estimator with lower bias but higher variance. GAE became especially important because it works very well with PPO.

## 7. Deep Deterministic Policy Gradient — 2015

DDPG extended actor-critic methods to continuous action spaces. Instead of producing a probability distribution, the actor directly outputs an action:

$$
a=\mu_\theta(s)
$$

The critic estimates $Q(s,a)$, and the actor is updated using the critic's gradient:

$$
\nabla_\theta J \approx \mathbb E\left[\nabla_aQ(s,a)\big|_{a=\mu(s)}\nabla_\theta\mu_\theta(s)\right]
$$

DDPG combines a deterministic actor, a critic, replay buffer, and target networks. It made deep RL much more practical for continuous control, but it can be highly sensitive to hyperparameters and is prone to unstable or overly optimistic Q-value estimates. TD3 was later introduced specifically to address these issues.

## 8. Proximal Policy Optimization — 2017

PPO simplified TRPO's trust-region idea. Instead of solving a constrained optimization problem, PPO uses a clipped probability-ratio objective.

$$
r_t(\theta)=\frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{\text{old}}}(a_t|s_t)}
$$

and:

$$
L^{CLIP}=\mathbb E\left[\min\left(r_tA_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)A_t\right)\right]
$$

The clipping prevents the updated policy from moving too far from the policy that generated the training data. PPO became popular because it is relatively stable, easy to implement, and effective across many environments. Its main limitation is that it is on-policy, meaning old data becomes less useful once the policy changes substantially, which makes PPO relatively sample inefficient compared with off-policy methods.

## 9. Twin Delayed DDPG — 2018

TD3 improves DDPG by reducing Q-value overestimation and stabilizing actor updates. It introduces three main changes: twin critics $Q_1$ and $Q_2$, delayed actor updates, and target-policy smoothing. The learning target uses the smaller critic estimate:

$$
y=r+\gamma\min(Q_1',Q_2')
$$

Using the minimum reduces optimistic bias, while delayed actor updates allow the critics more time to stabilize. Target-policy smoothing adds small noise to target actions:

$$
a'=\mu_{\theta'}(s')+\epsilon
$$

which prevents the policy from exploiting narrow inaccuracies in the learned Q-function. TD3 became a strong baseline for continuous-control problems.

## 10. Soft Actor-Critic — 2018

SAC introduced a maximum-entropy objective. Instead of optimizing only expected cumulative reward, it also rewards policy entropy:

$$
J(\pi)=\mathbb E\left[\sum_t r_t+\alpha\mathcal H(\pi(\cdot|s_t))\right]
$$

This encourages the policy to remain sufficiently stochastic rather than collapsing too early to one behavior. SAC combines a stochastic actor, twin critics, replay buffer, and entropy maximization. Because SAC is off-policy, experience can be reused many times, giving it much better sample efficiency than methods such as PPO. It remains one of the strongest classical baselines for continuous control because it combines exploration, sample efficiency, and relatively stable training.

## 11. Conservative Q-Learning — 2020

Offline reinforcement learning introduced a major shift: train a policy from a fixed dataset without collecting new environment interactions. A typical dataset contains transitions of the form:

$$
D=\{(s,a,r,s')\}
$$

The major problem is distribution shift. The learned policy may select actions that are rarely or never represented in the dataset, while the Q-function may incorrectly assign those actions very high values simply because there is no evidence contradicting them. CQL addresses this by making Q-value estimates deliberately conservative for unsupported actions. Conceptually, it tries to ensure uncertain actions are not overvalued, making offline learning safer and more stable.

## 12. World-Model Reinforcement Learning — 2020+

Most earlier methods are primarily model-free: they directly learn a policy $\pi(a|s)$ or value function $Q(s,a)$ without explicitly learning environment dynamics. Model-based reinforcement learning instead learns a transition model such as:

$$
P(s_{t+1}|s_t,a_t)
$$

Modern systems usually operate in a learned latent representation:

$$
s_t\rightarrow z_t
$$

and learn dynamics such as:

$$
(z_t,a_t)\rightarrow\hat z_{t+1}
$$

This allows the agent to generate imagined trajectories inside the learned model and use those trajectories for planning or policy optimization. The main advantage is improved sample efficiency because many learning updates can be generated from imagined experience rather than direct environment interaction. The main weakness is model bias: if the learned dynamics are inaccurate, prediction errors can accumulate across imagined trajectories and produce incorrect policy updates.

## 13. Decision Transformer — 2021

Decision Transformer introduced a fundamentally different perspective by treating reinforcement learning as sequence modeling. A trajectory can be represented as a sequence containing return-to-go, states, and actions:

$$
R_1,s_1,a_1,R_2,s_2,a_2,\ldots
$$

A Transformer then learns:

$$
P(a_t|R_{\text{target}},s_{\leq t},a_{<t})
$$

Rather than relying on Bellman equations or explicit policy gradients, Decision Transformer predicts actions conditioned on previous trajectory context and desired future return. This connected reinforcement learning with Transformer-based sequence modeling and helped establish the broader idea that decision making can sometimes be approached in the same way as language or sequence prediction.

## 14. Implicit Q-Learning — 2021

IQL was designed to solve one of the central problems of offline RL: Q-values are unreliable for actions that were never observed in the dataset. Instead of explicitly evaluating unseen actions, IQL learns a value function using expectile regression against observed Q-values, approximately making:

$$
V(s)\approx \text{upper expectile of }Q(s,a)
$$

It then learns Q-values and extracts a policy using advantage-weighted behavioral cloning:

$$
w(s,a)=\exp\left(\beta[Q(s,a)-V(s)]\right)
$$

Actions with larger estimated advantage receive greater weight. The important contribution is that IQL can improve upon dataset behavior while largely avoiding direct evaluation of out-of-distribution actions.

## 15. DreamerV3 — 2023

Dreamer represents one of the strongest modern examples of world-model reinforcement learning. The agent learns a latent dynamics model and then performs much of its policy optimization inside imagined trajectories rather than using only real transitions. The observation is encoded into a latent state, the world model predicts future latent states and rewards, and the actor-critic is trained on those imagined rollouts.

The central idea can be summarized as:

$$
\boxed{\text{learn from real experience}+\text{train extensively in imagination}}
$$

DreamerV3 demonstrated that a single world-model-based architecture could work across a wide range of environments, action spaces, observation types, and reward scales.

## 16. Diffusion Policies — 2023+

Diffusion policies introduced generative modeling into action generation. Traditional policies typically model:

$$
\pi(a_t|s_t)
$$

whereas a diffusion policy can model an entire action sequence:

$$
\pi(a_{t:t+H}|s_t)
$$

The process starts with noise:

$$
a^{(K)}\sim\mathcal N(0,I)
$$

and iteratively denoises it:

$$
a^{(K)}\rightarrow a^{(K-1)}\rightarrow\cdots\rightarrow a^{(0)}
$$

conditioned on the current state or observation history. One major advantage is multimodality. If multiple very different actions are all valid, a simple unimodal policy may average them into an undesirable compromise, while a generative model can represent several distinct modes simultaneously. Diffusion Policy itself originated primarily as a policy-learning and imitation-learning technique, but diffusion models are increasingly being integrated into reinforcement learning and planning.

## 17. World Models + Generative Policies — 2024–2026

One of the newest directions combines model-based reinforcement learning with generative policies. The world model predicts possible futures, while a diffusion or other generative policy produces distributions over action trajectories. Policy optimization can then happen partly or entirely inside the learned environment.

The overall idea is:

$$
\boxed{\text{World Model}+\text{Generative Policy}+\text{RL Optimization}}
$$

Rather than predicting only a single next action, the system can generate multiple candidate action sequences, simulate their consequences inside the learned model, estimate reward or value, and then improve the policy accordingly. Recent work explores this combination in online, offline, and offline-to-online settings, making it one of the most active directions in modern reinforcement learning.

## How the Techniques Relate

| Technique                   | Main problem it addressed                                              |
| --------------------------- | ---------------------------------------------------------------------- |
| Q-Learning                  | Learn action values without an explicit environment model              |
| REINFORCE                   | Directly optimize a policy                                             |
| Actor-Critic                | Reduce policy-gradient variance                                        |
| DQN                         | Scale Q-learning to high-dimensional inputs                            |
| TRPO                        | Prevent excessively large policy updates                               |
| GAE                         | Improve the bias-variance tradeoff of advantage estimates              |
| DDPG                        | Handle continuous action spaces                                        |
| PPO                         | Simplify stable policy optimization                                    |
| TD3                         | Reduce overestimation and instability in DDPG                          |
| SAC                         | Improve exploration and sample efficiency                              |
| CQL                         | Learn conservatively from fixed offline datasets                       |
| World Models                | Learn environment dynamics and train in imagination                    |
| Decision Transformer        | Reframe decision making as sequence modeling                           |
| IQL                         | Perform offline RL without relying heavily on unseen actions           |
| DreamerV3                   | Scale world-model RL across diverse domains                            |
| Diffusion Policy            | Represent multimodal action distributions                              |
| World Model + Generative RL | Combine learned dynamics, generative planning, and policy optimization |

## Model-Free vs Model-Based RL

Model-free methods directly learn a value function or policy, such as $Q(s,a)$ or $\pi(a|s)$, without explicitly learning how the environment transitions between states. Examples include Q-learning, DQN, REINFORCE, PPO, DDPG, TD3, SAC, CQL, and IQL.

Model-based methods additionally learn environment dynamics, typically something resembling:

$$
(s_t,a_t)\rightarrow\hat s_{t+1}
$$

or in modern latent form:

$$
(z_t,a_t)\rightarrow\hat z_{t+1}
$$

World models, Dreamer, MuZero-style learned dynamics, and recent world-model-plus-diffusion methods belong to this family. Their main advantage is sample efficiency, while their main risk is that model errors can compound and mislead the policy.

## On-Policy vs Off-Policy vs Offline RL

| Type       | Data source                   | Examples                        |
| ---------- | ----------------------------- | ------------------------------- |
| On-policy  | Current policy                | REINFORCE, TRPO, PPO            |
| Off-policy | Current and previous policies | Q-learning, DQN, DDPG, TD3, SAC |
| Offline    | Fixed dataset only            | CQL, IQL, Decision Transformer  |

On-policy methods train primarily on data generated by the current policy, so once the policy changes significantly, older data becomes less useful. Off-policy methods can learn from data generated by other or previous policies and therefore benefit from replay buffers. Offline RL goes further by training entirely from a fixed dataset, which introduces significant distribution-shift problems and motivates techniques such as CQL and IQL.

## Where GAE Fits

GAE should not be compared directly with PPO, SAC, or DQN because it operates at a different abstraction level. PPO is a policy-optimization algorithm, while GAE is an advantage estimator. A typical PPO implementation contains an actor, critic, GAE, clipped policy loss, value loss, and often an entropy bonus.

GAE produces:

$$
\hat A_t
$$

which PPO then uses inside its clipped objective:

$$
L^{CLIP}=\mathbb E\left[\min\left(r_t\hat A_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\hat A_t\right)\right]
$$

So the conceptual chain is simply:

$$
\text{TD Error}\rightarrow\text{GAE}\rightarrow\text{Advantage}\rightarrow\text{PPO Objective}\rightarrow\text{Policy Update}
$$

## The Broader Evolution

A compact chronological view is:

$$
\text{Q-Learning}
\rightarrow
\text{Policy Gradients}
\rightarrow
\text{Actor-Critic}
\rightarrow
\text{DQN}
\rightarrow
\text{TRPO + GAE}
\rightarrow
\text{DDPG}
\rightarrow
\text{PPO}
\rightarrow
\text{TD3 / SAC}
\rightarrow
\text{Offline RL}
\rightarrow
\text{CQL / IQL}
\rightarrow
\text{Decision Transformer}
\rightarrow
\text{World Models}
\rightarrow
\text{DreamerV3}
\rightarrow
\text{Diffusion Policies}
\rightarrow
\text{World Models + Generative Policy Optimization}
$$

The important pattern is that newer methods rarely make older ones completely obsolete. Instead, reinforcement learning keeps adding new layers and components. A modern system may simultaneously use actor-critic learning, advantage estimation, offline datasets, a learned world model, generative policies, and planning.

## Conclusion

The evolution of reinforcement learning can be understood as a sequence of increasingly ambitious questions. Q-learning asked how an agent could estimate which actions were valuable without knowing environment dynamics. Policy gradients asked whether a policy could be optimized directly. Actor-critic methods addressed the variance of policy gradients. DQN showed how neural networks could scale value-based learning to high-dimensional inputs. TRPO, GAE, and PPO focused on stable policy optimization. DDPG, TD3, and SAC improved continuous-control learning and sample efficiency. Offline RL methods such as CQL and IQL asked whether useful policies could be learned from fixed datasets. Decision Transformer connected reinforcement learning with sequence modeling. World-model methods such as Dreamer showed that agents could learn an internal model and train through imagined experience. Diffusion policies introduced powerful multimodal generative action models, and the newest direction increasingly combines world models, large offline datasets, generative policies, planning, and reinforcement-learning optimization.

The modern frontier is therefore less about discovering one universally superior algorithm and more about combining complementary techniques:

$$
\boxed{
\text{Representation Learning}
+
\text{World Models}
+
\text{Offline Data}
+
\text{Generative Policies}
+
\text{Planning}
+
\text{RL Optimization}
}
$$

That combination reflects the broader direction of contemporary reinforcement-learning research.

## References

The following primary research papers correspond to the techniques discussed above. Years refer to the cited publication or initial preprint; some methods appeared in conference or journal form later.

1. **Q-Learning:** Watkins, C. J. C. H., and Dayan, P. (1992). [Q-learning](https://link.springer.com/article/10.1007/BF00992698).
2. **REINFORCE:** Williams, R. J. (1992). [Simple statistical gradient-following algorithms for connectionist reinforcement learning](https://link.springer.com/article/10.1007/BF00992696).
3. **Actor-Critic:** Konda, V. R., and Tsitsiklis, J. N. (1999). [Actor-Critic Algorithms](https://papers.neurips.cc/paper/1786-actor-critic-algorithms).
4. **DQN:** Mnih, V., et al. (2015). [Human-level control through deep reinforcement learning](https://www.nature.com/articles/nature14236).
5. **TRPO:** Schulman, J., et al. (2015). [Trust Region Policy Optimization](https://arxiv.org/abs/1502.05477).
6. **GAE:** Schulman, J., et al. (2015). [High-Dimensional Continuous Control Using Generalized Advantage Estimation](https://arxiv.org/abs/1506.02438).
7. **DDPG:** Lillicrap, T. P., et al. (2015). [Continuous control with deep reinforcement learning](https://arxiv.org/abs/1509.02971).
8. **PPO:** Schulman, J., et al. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
9. **TD3:** Fujimoto, S., van Hoof, H., and Meger, D. (2018). [Addressing Function Approximation Error in Actor-Critic Methods](https://arxiv.org/abs/1802.09477).
10. **SAC:** Haarnoja, T., et al. (2018). [Soft Actor-Critic: Off-Policy Maximum Entropy Deep Reinforcement Learning with a Stochastic Actor](https://arxiv.org/abs/1801.01290).
11. **CQL:** Kumar, A., et al. (2020). [Conservative Q-Learning for Offline Reinforcement Learning](https://arxiv.org/abs/2006.04779).
12. **World-Model RL / Dreamer:** Hafner, D., et al. (2019; ICLR 2020). [Dream to Control: Learning Behaviors by Latent Imagination](https://arxiv.org/abs/1912.01603).
13. **Decision Transformer:** Chen, L., et al. (2021). [Decision Transformer: Reinforcement Learning via Sequence Modeling](https://arxiv.org/abs/2106.01345).
14. **IQL:** Kostrikov, I., Nair, A., and Levine, S. (2021). [Offline Reinforcement Learning with Implicit Q-Learning](https://arxiv.org/abs/2110.06169).
15. **DreamerV3:** Hafner, D., et al. (2023 preprint; updated title). [Mastering Diverse Domains through World Models](https://arxiv.org/abs/2301.04104).
16. **Diffusion Policy:** Chi, C., et al. (2023). [Diffusion Policy: Visuomotor Policy Learning via Action Diffusion](https://arxiv.org/abs/2303.04137). This paper focuses on imitation learning and provides the foundation for the diffusion-policy discussion.
17. **World Models + Generative Policies:** [DiWA: Diffusion Policy Adaptation with World Models](https://arxiv.org/abs/2508.03645) (2025 preprint). An example of adapting diffusion policies through reinforcement learning inside a learned world model.
18. **World Models + Diffusion Policy Optimization:** [Scaling World-Model Reinforcement Learning Through Diffusion Policy Optimization](https://arxiv.org/abs/2605.26282) (2026 preprint). A recent example connecting diffusion policies, search, and policy optimization in world models.
