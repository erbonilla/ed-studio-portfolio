import React from "react";
import "./animated-arrow-button.css";

const firstIconDots = [
  0, 2, 2, 1, 2,
  0, 1, 1, 2, 2,
  0, 1, 0, 2, 2,
  1, 0, 2, 2, 2,
  2, 0, 1, 0, 2,
] as const;

const secondIconDots = [0, 2, 2, 1, 2, 0, 1, 1, 2] as const;

type Button04Variant =
  | "brand"
  | "light"
  | "dark"
  | "outline-light"
  | "outline-dark";

type Button04Size = "small" | "medium" | "large";

type Button04SharedProps = {
  text?: string;
  compactText?: string;
  variant?: Button04Variant;
  size?: Button04Size;
  fullWidth?: boolean;
  className?: string;
};

type Button04AnchorProps = Button04SharedProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
  };

type Button04ButtonProps = Button04SharedProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

export type Button04Props = Button04AnchorProps | Button04ButtonProps;

const joinClassNames = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(" ");

function ButtonContent({
  text,
  compactText,
}: {
  text: string;
  compactText?: string;
}) {
  return (
    <>
      <span className="button04_bg" aria-hidden="true" />
      <span data-text={text} className="button04_inner">
        <span className="button04_label">
          <span
            className={joinClassNames(
              "button04_text",
              compactText ? "is-full" : undefined,
            )}
          >
            {text}
          </span>
          {compactText ? (
            <span className="button04_text is-compact">{compactText}</span>
          ) : null}
        </span>
        <span className="button04_icon-wrap" aria-hidden="true">
          <span
            style={{ "--index-parent": 0 } as React.CSSProperties}
            className="button04_icon"
          >
            {firstIconDots.map((index, dotIndex) => (
              <span
                key={`first-dot-${dotIndex}`}
                style={{ "--index": index } as React.CSSProperties}
                className="button04_dot"
              />
            ))}
          </span>
          <span
            style={{ "--index-parent": 1 } as React.CSSProperties}
            className="button04_icon is-arrow"
          >
            {secondIconDots.map((index, dotIndex) => (
              <span
                key={`second-dot-${dotIndex}`}
                style={{ "--index": index } as React.CSSProperties}
                className="button04_dot"
              />
            ))}
          </span>
        </span>
      </span>
    </>
  );
}

export function Button04(props: Button04Props) {
  const {
    text = "Nothing-Plop",
    compactText,
    variant = "brand",
    size = "medium",
    fullWidth = false,
    className,
    ...elementProps
  } = props;

  const classes = joinClassNames("button04", "w-inline-block", className);
  const dataProps = {
    className: classes,
    "data-variant": variant,
    "data-size": size,
    "data-full-width": fullWidth ? "" : undefined,
  };

  if ("href" in elementProps && elementProps.href !== undefined) {
    return (
      <a {...elementProps} {...dataProps}>
        <ButtonContent text={text} compactText={compactText} />
      </a>
    );
  }

  const buttonProps =
    elementProps as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type="button" {...buttonProps} {...dataProps}>
      <ButtonContent text={text} compactText={compactText} />
    </button>
  );
}
