import React from "react";
import "./animated-arrow-button.css";

const firstIconDots = [
  0, 2, 2, 1, 2,
  0, 1, 1, 2, 2,
  0, 1, 0, 2, 2,
  1, 0, 2, 2, 2,
  2, 0, 1, 0, 2,
] as const;

const secondIconDots = [
  { column: 4, row: 1, index: 2 },
  { column: 5, row: 2, index: 1 },
  { column: 1, row: 3, index: 2 },
  { column: 2, row: 3, index: 1 },
  { column: 3, row: 3, index: 0 },
  { column: 4, row: 3, index: 1 },
  { column: 5, row: 3, index: 0 },
  { column: 6, row: 3, index: 1 },
  { column: 5, row: 4, index: 1 },
  { column: 4, row: 5, index: 2 },
] as const;

type Button04Variant =
  | "brand"
  | "light"
  | "dark"
  | "outline-light"
  | "outline-dark";

type Button04Size = "small" | "medium" | "large";

/*
 * Where the arrow lands on hover. "diagonal" is the go-there gesture the rest
 * of the site uses; "down" turns the same glyph into a download, so a control
 * that hands over a file says so with the shape rather than a second icon.
 */
type Button04Arrow = "diagonal" | "down";

type Button04SharedProps = {
  /*
   * Required, not defaulted. The default used to be the template's
   * `"Nothing-Plop"` placeholder, so a forgotten prop shipped a nonsense label
   * instead of failing the build.
   */
  text: string;
  compactText?: string;
  /*
   * Swapped in under the pointer and on keyboard focus. Decoration only — it
   * is hidden from assistive tech and never touches the accessible name, so
   * "click Résumé — EN" keeps matching under voice control (WCAG 2.5.3).
   */
  hoverText?: string;
  variant?: Button04Variant;
  size?: Button04Size;
  arrow?: Button04Arrow;
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
  hoverText,
}: {
  text: string;
  compactText?: string;
  hoverText?: string;
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
          {hoverText ? (
            <span className="button04_text is-hover" aria-hidden="true">
              {hoverText}
            </span>
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
            {secondIconDots.map(({ column, row, index }, dotIndex) => (
              <span
                key={`second-dot-${dotIndex}`}
                style={
                  {
                    "--index": index,
                    gridColumn: column,
                    gridRow: row,
                  } as React.CSSProperties
                }
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
    text,
    compactText,
    hoverText,
    variant = "brand",
    size = "medium",
    arrow = "diagonal",
    fullWidth = false,
    className,
    ...elementProps
  } = props;

  const classes = joinClassNames("button04", "w-inline-block", className);
  const dataProps = {
    className: classes,
    "data-variant": variant,
    "data-size": size,
    "data-arrow": arrow,
    /* The label wipe is keyed off the button, not the span, so a button
       without a hover label never wipes the one it has. */
    "data-hover-label": hoverText ? "" : undefined,
    "data-full-width": fullWidth ? "" : undefined,
  };

  const content = (
    <ButtonContent text={text} compactText={compactText} hoverText={hoverText} />
  );

  if ("href" in elementProps && elementProps.href !== undefined) {
    return (
      <a {...elementProps} {...dataProps}>
        {content}
      </a>
    );
  }

  const buttonProps =
    elementProps as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type="button" {...buttonProps} {...dataProps}>
      {content}
    </button>
  );
}
