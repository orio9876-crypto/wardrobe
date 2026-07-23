import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <header className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1></div>{children}</header>;
}

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

type ActionButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;
export function PrimaryButton({ children, className = "", ...props }: ActionButtonProps) {
  return <button className={`button button--primary ${className}`.trim()} type="button" {...props}>{children}</button>;
}
export function SecondaryButton({ children, className = "", ...props }: ActionButtonProps) {
  return <button className={`button button--secondary ${className}`.trim()} type="button" {...props}>{children}</button>;
}

export function EmptyState({ title, body, children }: PropsWithChildren<{ title: string; body: string }>) {
  return <div className="empty-state"><div className="empty-state__icon" aria-hidden="true">✦</div><h2>{title}</h2><p>{body}</p>{children && <div className="empty-state__actions">{children}</div>}</div>;
}

export function StatusIndicator({ children, tone = "quiet" }: PropsWithChildren<{ tone?: "quiet" | "active" }>) {
  return <p className={`status status--${tone}`} role="status"><span aria-hidden="true" />{children}</p>;
}
