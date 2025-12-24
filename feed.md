Home Feed Module
Overview
The Home Feed module serves as the primary content discovery hub, displaying a TikTok-style vertical scroll of short-form video posts from coaches and communities. Users can engage with posts via likes, comments, shares, and reports, while navigating between tabs like Feed, Groups, Chat, and Profile. The module supports personalized recommendations based on user interests, with moderation tools for reporting inappropriate content.
Sub-Modules
1. Feed Tab
Requirements
Display vertical infinite-scroll list of video posts with auto-play/mute toggle.
Each post shows: Video thumbnail/full-screen video, creator avatar/username, like count/heart icon, comment count, share arrow, more options (≡).
Post metadata: Caption with read more/less, hashtags, external links.
Bottom navigation: Feed (active), Groups, + (create), Chat, Profile icons with labels.
Support swipe gestures for navigation; pause video on tab switch.
Personalize feed based on user interests from onboarding.
Handle offline: Show cached posts with placeholder for new content.
2. Post Interactions
Requirements
Like/unlike post with heart icon and count update.
Share post via native iOS/Android share sheet.
Tap more (≡) for post options: Report post, Block user.
Expanded post view on tap: Full caption, links, tags; overlay for actions.
Display post stats: Views count, likes, comments.
3. Comments Modal
Requirements
Open as bottom-sheet modal on comment tap; shows total comments count.
List comments chronologically with: User avatar/name, comment text, like count/heart, reply button.
Support threaded replies: Indent sub-replies, tap to expand/collapse.
"No comments yet! Be the first to add a comment" placeholder if empty.
Add comment: Text input at bottom with send button; keyboard integration.
Support emoji reactions on comments.
4. Comment Management
Requirements
Long-press comment or tap user avatar for menu: Block user, Delete (if own), Report comment.
Block user: Confirmation modal with "Block User?" and effects description.
Delete comment: Modal "Delete Comment? Are you sure you want to delete this comment?" with Cancel/Delete buttons.
Handle multi-reply view: "View X more replies" expander.
5. Reporting System
Requirements
Report comment/post: Modal with "Why are you reporting this [comment/post]?" subtitle.
Predefined reasons: Spam or Self Promotion (radio), Hate Speech or Symbols, Harassment or Bullying, Inappropriate or Offensive Language, False Information, Something Else (with text input "Please tell us more").
Submit feedback button; on submit, show success modal "Thanks for Feedback. We have submitted your feedback and will act on it."
Separate flows for post vs. comment reports.
Anonymize reports; track for moderation.
6. Bottom Navigation
Requirements
Persistent bar with icons: Home (Feed), Groups, + (fab for create post), Chat, Profile.
Highlight active tab; support haptic feedback on tap.
button: Opens create post modal (future module integration).
User Flow
User accesses home after onboarding or from bottom navigation.
Lands on Feed tab with infinite-scrolling video posts auto-playing vertically.
Swipes up/down to browse posts; taps post for expanded view with like, comment, share options.
Taps comment icon to open comments modal; views list, adds new comment via keyboard, or replies to existing.
In comments, long-press or taps user/comment for actions like block user, delete (own), or report.
For report: Selects reason from predefined options, optionally adds details, submits feedback.
Similarly, on post: Taps report icon for post-level reporting with same reasons.
On submit report or delete: Shows confirmation/success modal; returns to feed/comments.
Switches tabs via bottom navigation: Feed (default), Groups, +, Chat, Profile.
In expanded post view: Shows full caption, hashtags, links; allows read more/less toggle.
Overview
The Search module enables users to discover coaches, users, groups, and posts through a unified search interface. It supports recent searches, categorized results (For You, Groups, Users, Posts), and empty state handling, with seamless navigation to detailed views. The module integrates with the app's search functionality to prioritize results based on user-entered queries.
