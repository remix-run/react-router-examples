import * as React from "react";
import { createPortal } from "react-dom";
import {
  Outlet,
  Link,
  useNavigate,
  useParams,
  RouterProvider,
  createBrowserRouter,
} from "react-router";

import { IMAGES, getImageById } from "./images";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "/",
        Component: Home,
      },
      {
        path: "gallery",
        Component: Gallery,
        children: [
          {
            path: "img/:id",
            Component: ImageView,
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

export function Layout() {
  return (
    <div>
      <h1>Outlet Modal Example</h1>
      <p>
        This is a modal example using createBrowserRouter that drives modal
        displays through URL segments. The modal is a child route of its parent
        and renders in the Outlet.
      </p>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/gallery">Gallery</Link>
            </li>
          </ul>
        </nav>
        <hr />
      </div>
      <Outlet />
    </div>
  );
}

export function Home() {
  return (
    <div>
      <h2>Home</h2>
      <p>
        Click over to the <Link to="/gallery">Gallery</Link> route to see the
        modal in action
      </p>
      <Outlet />
    </div>
  );
}

export function Gallery() {
  return (
    <div style={{ padding: "0 24px" }}>
      <h2>Gallery</h2>
      <p>
        Click on an image, you'll notice that you still see this route behind
        the modal. The URL will also change as its a child route of{" "}
        <pre style={{ display: "inline" }}>/gallery</pre>{" "}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
        }}
      >
        {IMAGES.map((image) => (
          <Link key={image.id} to={`img/${image.id}`}>
            <img
              width={200}
              height={200}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                height: "auto",
                borderRadius: "8px",
              }}
              src={image.src}
              alt={image.title}
            />
          </Link>
        ))}
        <Outlet />
      </div>
    </div>
  );
}

export function ImageView() {
  let navigate = useNavigate();
  let { id } = useParams<"id">();
  let image = getImageById(Number(id));
  let buttonRef = React.useRef<HTMLButtonElement>(null);

  function onDismiss() {
    navigate(-1);
  }

  if (!image) {
    throw new Error(`No image found with id: ${id}`);
  }

  return (
    <Dialog
      aria-labelledby="label"
      onDismiss={onDismiss}
      initialFocusRef={buttonRef}
    >
      <div
        style={{
          display: "grid",
          justifyContent: "center",
          padding: "8px 8px",
        }}
      >
        <h1 id="label" style={{ margin: 0 }}>
          {image.title}
        </h1>
        <img
          style={{
            margin: "16px 0",
            borderRadius: "8px",
            width: "100%",
            height: "auto",
          }}
          width={400}
          height={400}
          src={image.src}
          alt=""
        />
        <button
          style={{ display: "block" }}
          ref={buttonRef}
          onClick={onDismiss}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}

type DialogProps = {
  children: React.ReactNode;
  onDismiss: () => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
};

function Dialog({
  children,
  onDismiss,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  initialFocusRef,
}: DialogProps) {
  let contentRef = React.useRef<HTMLDivElement>(null);
  let previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    let focusTarget = initialFocusRef?.current ?? contentRef.current;
    if (focusTarget) {
      focusTarget.focus();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onDismiss();
        return;
      }

      if (event.key === "Tab") {
        let container = contentRef.current;
        if (!container) return;

        let focusable = getFocusableElements(container);
        if (focusable.length === 0) {
          event.preventDefault();
          container.focus();
          return;
        }

        let activeElement = document.activeElement as HTMLElement | null;
        let currentIndex = focusable.indexOf(activeElement ?? focusable[0]);

        let nextIndex = currentIndex;
        if (event.shiftKey) {
          nextIndex =
            currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
        } else {
          nextIndex =
            currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
        }

        event.preventDefault();
        focusable[nextIndex].focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [initialFocusRef, onDismiss]);

  return createPortal(
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onDismiss();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 1000,
      }}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        tabIndex={-1}
        style={{
          background: "white",
          borderRadius: "12px",
          maxWidth: "min(480px, 100%)",
          width: "100%",
          padding: "24px",
          boxShadow:
            "0 20px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.06)",
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}
