import { useState, useEffect, useRef, useCallback, forwardRef  } from "react"
import styles from "./Comment.module.css"
import {
  ThumbsUp, ThumbsDown, MessageSquare, MoreHorizontal,
  Bold, Italic, Underline, Paperclip, Image, Smile,
  AtSign, ArrowUpDown, BadgeCheck, Flag, Trash2, Pencil
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// CURRENT USER — replace with real auth context when backend is connected
// e.g. const currentUser = useAuth().user
// ─────────────────────────────────────────────────────────────────────────────
const CURRENT_USER = {
  id: "me",
  name: "You",
  initials: "YO",
  avatarColor: "#1B56FD",
  verified: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA — remove this array when fetching from GET /api/comments?placeId=…
// ─────────────────────────────────────────────────────────────────────────────
const SEED_COMMENTS = [
  {
    id: 1, authorId: "u1", author: "Noah Pierre", initials: "NP", avatarColor: "#c4a882", verified: false,
    createdAt: Date.now() - 58 * 60 * 1000, updatedAt: null,
    text: "I'm a bit unclear about how condensation forms in the water cycle. Can someone break it down?",
    likes: 25, dislikes: 3, liked: false, disliked: false,
    replies: [
      {
        id: 11, authorId: "u2", author: "Skill Sprout", initials: "SS", avatarColor: "#1B56FD", verified: true,
        createdAt: Date.now() - 8 * 60 * 1000, updatedAt: null,
        text: "Condensation happens when water vapor cools down and changes back into liquid droplets. It's the step before precipitation. The example with the glass of ice water in the video was a great visual!",
        likes: 2, dislikes: 0, liked: false, disliked: false,
      }
    ]
  },
  {
    id: 2, authorId: "u3", author: "Mollie Hall", initials: "MH", avatarColor: "#9b7fa8", verified: false,
    createdAt: Date.now() - 5 * 3600 * 1000, updatedAt: null,
    text: "I really enjoyed today's lesson on the water cycle! The animations made the processes so much easier to grasp.",
    likes: 14, dislikes: 1, liked: false, disliked: false, replies: []
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
let _nextId = 9000

function genId() { return ++_nextId }

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)} minutes ago`
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`
  return `${Math.floor(s / 86400)} days ago`
}

function makeComment(text) {
  return {
    id: genId(),
    authorId: CURRENT_USER.id,
    author: CURRENT_USER.name,
    initials: CURRENT_USER.initials,
    avatarColor: CURRENT_USER.avatarColor,
    verified: CURRENT_USER.verified,
    createdAt: Date.now(),
    updatedAt: null,
    text,
    likes: 0, dislikes: 0, liked: false, disliked: false,
    replies: [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 36 }) {
  return (
    <div
      className={styles.avatar}
      style={{ background: color, width: size, height: size, fontSize: size * 0.33 }}
    >
      {initials}
    </div>
  )
}

function MoreMenu({ isOwn, onEdit, onDelete, onReport }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className={styles["more-wrap"]} ref={ref}>
      <button
        className={styles["action-btn"]}
        onClick={() => setOpen(p => !p)}
        aria-label="More options"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className={styles["more-menu"]}>
          {isOwn ? (
            <>
              <button onClick={() => { setOpen(false); onEdit() }}>
                <Pencil size={13} /> Edit
              </button>
              <button className={styles.danger} onClick={() => { setOpen(false); onDelete() }}>
                <Trash2 size={13} /> Delete
              </button>
            </>
          ) : (
            <button onClick={() => { setOpen(false); onReport() }}>
              <Flag size={13} /> Report
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ReplyComposer({ onSubmit, onCancel }) {
  const [text, setText] = useState("")
  const ref = useRef()

  useEffect(() => { ref.current?.focus() }, [])

  function handleKey(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && text.trim()) {
      onSubmit(text.trim())
    }
  }

  return (
    <div className={styles["reply-composer"]}>
      <textarea
        ref={ref}
        className={styles["reply-input"]}
        placeholder="Write a reply…"
        rows={2}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
      />
      <div className={styles["reply-footer"]}>
        <button className={`${styles["btn-sm"]} ${styles["btn-cancel"]}`} onClick={onCancel}>Cancel</button>
        <button
          className={`${styles["btn-sm"]} ${styles["btn-save"]}`}
          disabled={!text.trim()}
          onClick={() => onSubmit(text.trim())}
        >
          Reply
        </button>
      </div>
    </div>
  )
}

function CommentItem({ comment, isReply = false, onLike, onDislike, onReply, onEdit, onDelete, onReport }) {
  const [editing, setEditing] = useState(false)
  const [editDraft, setEditDraft] = useState(comment.text)
  const [showReplyBox, setShowReplyBox] = useState(false)
  const isOwn = comment.authorId === CURRENT_USER.id

  function saveEdit() {
    const trimmed = editDraft.trim()
    if (trimmed && trimmed !== comment.text) onEdit(comment.id, trimmed)
    setEditing(false)
  }

  function handleReport() {
    // TODO: POST /api/comments/:id/report  →  { reason: "inappropriate" }
    alert("Report submitted. Our team will review it.")
    onReport?.(comment.id)
  }

  if (comment.deleted) {
    return <p className={styles["deleted-note"]}>[Comment deleted]</p>
  }

  return (
    <div className={styles.comment}>
      <Avatar initials={comment.initials} color={comment.avatarColor} />
      <div className={styles["comment-body"]}>

        <div className={styles["comment-meta"]}>
          <span className={styles["comment-author"]}>{comment.author}</span>
          {comment.verified && (
            <span className={styles["verified"]} title="Verified">
              <BadgeCheck size={15} />
            </span>
          )}
          <span className={styles["comment-time"]}>{timeAgo(comment.createdAt)}</span>
          {comment.updatedAt && <span className={styles["edited-tag"]}>· edited</span>}
        </div>

        {editing ? (
          <>
            <textarea
              className={styles["edit-area"]}
              rows={3}
              value={editDraft}
              onChange={e => setEditDraft(e.target.value)}
              autoFocus
            />
            <div className={styles["edit-actions"]}>
              <button className={`${styles["btn-sm"]} ${styles["btn-save"]}`} onClick={saveEdit}>Save</button>
              <button className={`${styles["btn-sm"]} ${styles["btn-cancel"]}`} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <p className={styles["comment-text"]}>{comment.text}</p>
        )}

        <div className={styles["comment-actions"]}>
          <button
            className={`${styles["action-btn"]} ${comment.liked ? styles.liked : ""}`}
            onClick={() => onLike(comment.id)}
          >
            <ThumbsUp size={14} /> <span>{comment.likes}</span>
          </button>
          <button
            className={`${styles["action-btn"]} ${comment.disliked ? styles.disliked : ""}`}
            onClick={() => onDislike(comment.id)}
          >
            <ThumbsDown size={14} /> <span>{comment.dislikes}</span>
          </button>
          {!isReply && (
            <button
              className={`${styles["action-btn"]} ${showReplyBox ? styles["reply-active"] : ""}`}
              onClick={() => setShowReplyBox(p => !p)}
            >
              <MessageSquare size={14} /> <span>Reply</span>
            </button>
          )}
          <MoreMenu
            isOwn={isOwn}
            onEdit={() => setEditing(true)}
            onDelete={() => onDelete(comment.id)}
            onReport={handleReport}
          />
        </div>

        {showReplyBox && (
          <ReplyComposer
            onSubmit={(text) => { onReply(comment.id, text); setShowReplyBox(false) }}
            onCancel={() => setShowReplyBox(false)}
          />
        )}

        {!isReply && comment.replies?.length > 0 && (
          <div className={styles["reply-thread"]}>
            {comment.replies.filter(r => !r.deleted).map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply
                onLike={onLike}
                onDislike={onDislike}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

// Props:
//   placeId  — required when connected to backend (used in API calls)
//   initialComments — optional; defaults to SEED_COMMENTS (remove seed when using API)

const CommentSection = forwardRef(({ placeId, initialComments = SEED_COMMENTS }, ref) => {
  const [comments, setComments] = useState(initialComments)
  const [input, setInput] = useState("")
  const [sortNewest, setSortNewest] = useState(true)
  // TODO: replace with loading state from API: const [loading, setLoading] = useState(true)

  // ── FETCH on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    // TODO: fetch from GET /api/comments?placeId=${placeId}
    // Example:
    // setLoading(true)
    // fetch(`/api/comments?placeId=${placeId}`)
    //   .then(r => r.json())
    //   .then(data => setComments(data))
    //   .catch(console.error)
    //   .finally(() => setLoading(false))
  }, [placeId])

  const totalCount = useCallback(() => {
    return comments.filter(c => !c.deleted).length
      + comments.flatMap(c => c.replies ?? []).filter(r => !r.deleted).length
  }, [comments])

  const sorted = useCallback(() => {
    return [...comments].sort((a, b) => sortNewest ? b.createdAt - a.createdAt : a.createdAt - b.createdAt)
  }, [comments, sortNewest])

  // ── MUTATIONS ───────────────────────────────────────────────────────────────

  function submitComment() {
    const text = input.trim()
    if (!text) return
    const newComment = makeComment(text)

    setComments(prev => [newComment, ...prev])
    setInput("")

    // TODO: POST /api/comments  →  { placeId, text }
    // On success, replace optimistic comment with server-returned id:
    // fetch("/api/comments", { method: "POST", body: JSON.stringify({ placeId, text }) })
    //   .then(r => r.json())
    //   .then(saved => setComments(prev => prev.map(c => c.id === newComment.id ? saved : c)))
    //   .catch(() => setComments(prev => prev.filter(c => c.id !== newComment.id))) // rollback
  }

  function handleLike(id) {
    setComments(prev => mutateLike(prev, id, "like"))
    // TODO: POST /api/comments/:id/like  →  toggle
  }

  function handleDislike(id) {
    setComments(prev => mutateLike(prev, id, "dislike"))
    // TODO: POST /api/comments/:id/dislike  →  toggle
  }

  function handleReply(parentId, text) {
    const reply = makeComment(text)
    setComments(prev => prev.map(c =>
      c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c
    ))
    // TODO: POST /api/comments  →  { placeId, parentId, text }
    // Same optimistic pattern as submitComment above
  }

  function handleEdit(id, newText) {
    setComments(prev => mutateText(prev, id, newText))
    // TODO: PATCH /api/comments/:id  →  { text: newText }
  }

  function handleDelete(id) {
    setComments(prev => mutateDeleted(prev, id))
    // TODO: DELETE /api/comments/:id
  }

  // ── KEY HANDLER ─────────────────────────────────────────────────────────────
  function handleKey(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && input.trim()) submitComment()
  }

  // ── TOOLBAR: wrap selected text ─────────────────────────────────────────────
  const textareaRef = useRef()
  function wrapSelection(before, after) {
    const el = textareaRef.current
    if (!el) return
    const s = el.selectionStart, e = el.selectionEnd
    const selected = input.substring(s, e) || "text"
    const next = input.substring(0, s) + before + selected + after + input.substring(e)
    setInput(next)
    setTimeout(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + selected.length) }, 0)
  }

  return (
    <section className={styles.section} ref={ref}>
      <h2 className={styles["section-title"]}>
        Comments
        <span className={styles["count-badge"]}>{totalCount()}</span>
        <span style={{ flex: 1 }} />
        <button className={styles["sort-btn"]} onClick={() => setSortNewest(p => !p)}>
          <ArrowUpDown size={13} />
          {sortNewest ? "Most recent" : "Oldest first"}
        </button>
      </h2>

      {/* ── COMPOSER ── */}
      <div className={styles.composer}>
        <textarea
          ref={textareaRef}
          className={styles["composer-input"]}
          placeholder="Add comment… (Ctrl+Enter to submit)"
          rows={2}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <div className={styles["composer-toolbar"]}>
          <div className={styles["composer-tools"]}>
            <button className={styles["tool-btn"]} title="Bold" onClick={() => wrapSelection("**", "**")}><Bold size={13} /></button>
            <button className={styles["tool-btn"]} title="Italic" onClick={() => wrapSelection("_", "_")}><Italic size={13} /></button>
            <button className={styles["tool-btn"]} title="Underline" onClick={() => wrapSelection("<u>", "</u>")}><Underline size={13} /></button>
            <div className={styles["tool-sep"]} />
            {/* TODO: wire Paperclip to a file-upload handler → POST /api/media */}
            <button className={styles["tool-btn"]} title="Attach file"><Paperclip size={14} /></button>
            {/* TODO: wire Image to an image-picker → POST /api/media */}
            <button className={styles["tool-btn"]} title="Image"><Image size={14} /></button>
            {/* TODO: wire Smile to an emoji picker library */}
            <button className={styles["tool-btn"]} title="Emoji"><Smile size={14} /></button>
            {/* TODO: wire AtSign to a @mention autocomplete */}
            <button className={styles["tool-btn"]} title="Mention"><AtSign size={14} /></button>
          </div>
          <button
            className={styles["submit-btn"]}
            disabled={!input.trim()}
            onClick={submitComment}
          >
            Submit
          </button>
        </div>
      </div>

      {/* ── COMMENTS ── */}
      <div className={styles["comments-list"]}>
        {sorted().filter(c => !c.deleted).length === 0 ? (
          <p className={styles["empty-state"]}>No comments yet. Be the first!</p>
        ) : (
          sorted().filter(c => !c.deleted).map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onDislike={handleDislike}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </section>
  )
})

//debugging label for React DevTools, When you wrap a component with forwardRef, React loses the function name internally
CommentSection.displayName = "CommentSection"
export default CommentSection

// ─────────────────────────────────────────────────────────────────────────────
// PURE IMMUTABLE HELPERS — used by state mutators above
// ─────────────────────────────────────────────────────────────────────────────

function mutateLike(comments, id, kind) {
  return comments.map(c => {
    if (c.id === id) return applyVote(c, kind)
    return { ...c, replies: (c.replies ?? []).map(r => r.id === id ? applyVote(r, kind) : r) }
  })
}

function applyVote(c, kind) {
  if (kind === "like") {
    const wasLiked = c.liked
    return {
      ...c,
      liked: !wasLiked,
      likes: wasLiked ? c.likes - 1 : c.likes + 1,
      disliked: wasLiked ? c.disliked : false,
      dislikes: (!wasLiked && c.disliked) ? c.dislikes - 1 : c.dislikes,
    }
  }
  const wasDisliked = c.disliked
  return {
    ...c,
    disliked: !wasDisliked,
    dislikes: wasDisliked ? c.dislikes - 1 : c.dislikes + 1,
    liked: wasDisliked ? c.liked : false,
    likes: (!wasDisliked && c.liked) ? c.likes - 1 : c.likes,
  }
}

function mutateText(comments, id, text) {
  return comments.map(c => {
    if (c.id === id) return { ...c, text, updatedAt: Date.now() }
    return { ...c, replies: (c.replies ?? []).map(r => r.id === id ? { ...r, text, updatedAt: Date.now() } : r) }
  })
}

function mutateDeleted(comments, id) {
  return comments.map(c => {
    if (c.id === id) return { ...c, deleted: true }
    return { ...c, replies: (c.replies ?? []).map(r => r.id === id ? { ...r, deleted: true } : r) }
  })
}