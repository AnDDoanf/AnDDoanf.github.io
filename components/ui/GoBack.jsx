"use client";
import Link from "next/link";

export default function GoBack({ href = "" }) {
    const goBack = () => {
        if (href === "") {
            window.history.back();
        } else {
            window.location.href = href;
        }
    };
    return (
        <button
        className="go-back"
        onClick={goBack}
        aria-label="Go back"
        type="button"
        >
        ←
        </button>
    );
    }
