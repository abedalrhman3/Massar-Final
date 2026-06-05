import { useState, useEffect, useRef, useCallback, forwardRef } from "react"
import styles from "./Comment.module.css"
import {
  ThumbsUp, ThumbsDown, MessageSquare, MoreHorizontal,
  Bold, Italic, Underline, Paperclip, Image, Smile,
  AtSign, ArrowUpDown, BadgeCheck, Flag, Trash2, Pencil
} from "lucide-react"
import {
  getComments, createComment, likeComment, dislikeComment,
  updateComment, deleteComment,
} from "@/api/comments"
import { useAuth } from "@/context/AuthContext"

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)} minutes ago`
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`
  return `${Math.floor(s / 86400)} days ago`
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS (unchanged structure, keep all classes intact)
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

function CommentItem({ comment, currentUserId, isReply = false, onLike, onDislike, onReply, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [editDraft, setEditDraft] = useState(comment.text)
  const [showReplyBox, setShowReplyBox] = useState(false)
  const isOwn = comment.authorId === currentUserId

  function saveEdit() {
    const trimmed = editDraft.trim()
    if (trimmed && trimmed !== comment.text) onEdit(comment.id, trimmed)
    setEditing(false)
  }

  function handleReport() {
    alert("Report submitted. Our team will review it.")
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
                currentUserId={currentUserId}
                isReply
                onLike={onLike}
                onDislike={onDislike}
                onEdit={onEdit}
                onDelete={onDelete}
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

const CommentSection = forwardRef(({ placeId }, ref) => {
  const [comments, setComments] = useState([])
  const [input, setInput] = useState("")
  const [sortNewest, setSortNewest] = useState(true)
  const [loading, setLoading] = useState(true)

  // Get the logged-in user from the app's auth context
  const { user } = useAuth()
  const currentUserId = user?._id ?? null

  // ── FETCH on mount / placeId change ─────────────────────────────────────────
  useEffect(() => {
    if (!placeId) return

    setLoading(true)

    getComments(placeId)
      .then(res => {
        setComments(res.data?.data || [])
      })
      .catch(err => {
        console.error("Failed to load comments:", err)
        setComments([])
      })
      .finally(() => setLoading(false))
  }, [placeId])

  const totalCount = useCallback(() => {
    return comments.filter(c => !c.deleted).length
      + comments.flatMap(c => c.replies ?? []).filter(r => !r.deleted).length
  }, [comments])

  const sorted = useCallback(() => {
    return [...comments].sort((a, b) => sortNewest ? b.createdAt - a.createdAt : a.createdAt - b.createdAt)
  }, [comments, sortNewest])

  // ── TOOLBAR ─────────────────────────────────────────────────────────────────
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

  // ── MUTATIONS ───────────────────────────────────────────────────────────────

  async function submitComment() {
    const text = input.trim()
    if (!text) return

    if (!currentUserId) {
      alert("Please log in to comment.")
      return
    }

    // Optimistic placeholder
    const tempId = `temp-${Date.now()}`
    const userName = user?.name || user?.username || "You"
    const initials = userName.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() || "YO"
    const optimistic = {
      id: tempId,
      authorId: currentUserId,
      author: userName,
      initials,
      avatarColor: "var(--color-accent)",
      verified: !!user?.isVerified,
      createdAt: Date.now(),
      updatedAt: null,
      text,
      likes: 0, dislikes: 0, liked: false, disliked: false,
      replies: [],
    }
    setComments(prev => [optimistic, ...prev])
    setInput("")

    try {
      const res = await createComment(placeId, text)
      const saved = res.data?.data
      setComments(prev => prev.map(c => c.id === tempId ? saved : c))
    } catch (err) {
      console.error("Failed to submit comment:", err)
      setComments(prev => prev.filter(c => c.id !== tempId))
      if (err.response?.status === 401) alert("Please log in to comment.")
    }
  }

  async function handleLike(id) {
    if (!currentUserId) { alert("Please log in to vote."); return }

    // Optimistic toggle
    setComments(prev => mutateLike(prev, id, "like"))

    try {
      const res = await likeComment(id)
      const { likes, dislikes, liked, disliked } = res.data
      setComments(prev => mutateVoteFromServer(prev, id, { likes, dislikes, liked, disliked }))
    } catch (err) {
      console.error("Failed to like comment:", err)
      setComments(prev => mutateLike(prev, id, "like")) // rollback
    }
  }

  async function handleDislike(id) {
    if (!currentUserId) { alert("Please log in to vote."); return }

    setComments(prev => mutateLike(prev, id, "dislike"))

    try {
      const res = await dislikeComment(id)
      const { likes, dislikes, liked, disliked } = res.data
      setComments(prev => mutateVoteFromServer(prev, id, { likes, dislikes, liked, disliked }))
    } catch (err) {
      console.error("Failed to dislike comment:", err)
      setComments(prev => mutateLike(prev, id, "dislike"))
    }
  }

  async function handleReply(parentId, text) {
    if (!currentUserId) { alert("Please log in to reply."); return }

    const tempId = `temp-${Date.now()}`
    const reply = {
      id: tempId,
      authorId: currentUserId,
      author: "You",
      initials: "YO",
      avatarColor: "var(--color-accent)",
      verified: false,
      createdAt: Date.now(),
      updatedAt: null,
      text,
      likes: 0, dislikes: 0, liked: false, disliked: false,
    }
    setComments(prev => prev.map(c =>
      c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c
    ))

    try {
      const res = await createComment(placeId, text, parentId)
      const saved = res.data?.data
      setComments(prev => prev.map(c =>
        c.id === parentId
          ? { ...c, replies: (c.replies ?? []).map(r => r.id === tempId ? saved : r) }
          : c
      ))
    } catch (err) {
      console.error("Failed to submit reply:", err)
      setComments(prev => prev.map(c =>
        c.id === parentId ? { ...c, replies: (c.replies ?? []).filter(r => r.id !== tempId) } : c
      ))
    }
  }

  async function handleEdit(id, newText) {
    setComments(prev => mutateText(prev, id, newText))

    try {
      await updateComment(id, newText)
    } catch (err) {
      console.error("Failed to edit comment:", err)
    }
  }

  async function handleDelete(id) {
    setComments(prev => mutateDeleted(prev, id))

    try {
      await deleteComment(id)
    } catch (err) {
      console.error("Failed to delete comment:", err)
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && input.trim()) submitComment()
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
          placeholder={currentUserId ? "Add comment… (Ctrl+Enter to submit)" : "Log in to leave a comment…"}
          rows={2}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={!currentUserId}
        />
        <div className={styles["composer-toolbar"]}>
          <div className={styles["composer-tools"]}>
            <button className={styles["tool-btn"]} title="Bold" onClick={() => wrapSelection("**", "**")}><Bold size={13} /></button>
            <button className={styles["tool-btn"]} title="Italic" onClick={() => wrapSelection("_", "_")}><Italic size={13} /></button>
            <button className={styles["tool-btn"]} title="Underline" onClick={() => wrapSelection("<u>", "</u>")}><Underline size={13} /></button>
            <div className={styles["tool-sep"]} />
            <button className={styles["tool-btn"]} title="Attach file"><Paperclip size={14} /></button>
            <button className={styles["tool-btn"]} title="Image"><Image size={14} /></button>
            <button className={styles["tool-btn"]} title="Emoji"><Smile size={14} /></button>
            <button className={styles["tool-btn"]} title="Mention"><AtSign size={14} /></button>
          </div>
          <button
            className={styles["submit-btn"]}
            disabled={!input.trim() || !currentUserId}
            onClick={submitComment}
          >
            Submit
          </button>
        </div>
      </div>

      {/* ── COMMENTS LIST ── */}
      <div className={styles["comments-list"]}>
        {loading ? (
          <p className={styles["empty-state"]}>Loading comments…</p>
        ) : sorted().filter(c => !c.deleted).length === 0 ? (
          <p className={styles["empty-state"]}>No comments yet. Be the first!</p>
        ) : (
          sorted().filter(c => !c.deleted).map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
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

CommentSection.displayName = "CommentSection"
export default CommentSection

// ─────────────────────────────────────────────────────────────────────────────
// PURE IMMUTABLE HELPERS
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

function mutateVoteFromServer(comments, id, { likes, dislikes, liked, disliked }) {
  return comments.map(c => {
    if (c.id === id) return { ...c, likes, dislikes, liked, disliked }
    return { ...c, replies: (c.replies ?? []).map(r => r.id === id ? { ...r, likes, dislikes, liked, disliked } : r) }
  })
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