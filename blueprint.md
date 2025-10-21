# Project Blueprint

## Overview

This project is a movie and TV series streaming platform called MovieBox.

## Style and Design

*   Modern, dark theme
*   Visually balanced layout with clean spacing
*   Interactive UI components with hover effects
*   Responsive design for mobile and web

## Features

*   User authentication (email/password and Google)
*   Admin dashboard for managing content
*   Browse movies, TV series, and other content
*   Search functionality
*   User profiles
*   Subscription-based access to content

## Current Plan

*   **Task:** Update Firebase configuration and admin email.
*   **Steps:**
    1.  Updated the admin email in `lib/auth-context.tsx`.
    2.  Deleted the old `lib/firebase.ts` file.
    3.  Created a new `lib/firebase.ts` file with the new Firebase project's configuration.
    4.  Created a `firestore.rules` file with updated security rules.