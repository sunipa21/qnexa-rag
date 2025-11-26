# Git Workflow Guide

This guide outlines the best practices for managing code changes in this repository.

## 1. Working with Feature Branches (Recommended)

This is the standard "Best Practice" workflow. It keeps the `main` branch clean and stable.

### Step-by-Step Commands

1.  **Update your local main branch**
    Always start from the latest code.
    ```bash
    git checkout main
    git pull AI_Knowledge_Management main
    ```

2.  **Create a new branch**
    Name it descriptively (e.g., `feature/add-login`, `fix/nav-bug`).
    ```bash
    git checkout -b feature/my-new-feature
    ```

3.  **Make your changes**
    Edit files, write code, etc.

4.  **Stage and Commit**
    ```bash
    git add .
    git commit -m "feat: add new login page"
    ```

5.  **Push the branch**
    The first time you push a new branch, you need to set the upstream.
    ```bash
    git push -u AI_Knowledge_Management feature/my-new-feature
    ```

6.  **Create a Pull Request (PR)**
    Go to GitHub and you will see a prompt to "Compare & pull request". This allows you to review code before merging it into `main`.

---

## 2. Pushing Directly to Main

If you are working alone or on a small team, you might push directly to `main`.

### The Golden Rule: Always Pull Before You Push

If you try to push and someone else has updated `main`, your push will be rejected. You must sync (rebase) first.

### Step-by-Step Commands

1.  **Stage and Commit your changes**
    ```bash
    git add .
    git commit -m "update: fixed styling on home page"
    ```

2.  **Pull and Rebase (CRITICAL STEP)**
    This downloads new changes from GitHub and "replays" your work on top of them. It prevents messy merge commits.
    ```bash
    git pull --rebase AI_Knowledge_Management main
    ```
    *If there are conflicts, resolve them, `git add .`, and `git rebase --continue`.*

3.  **Push to Main**
    ```bash
    git push AI_Knowledge_Management main
    ```

## Summary of Best Practices

-   **Commit Often**: Small, logical commits are easier to fix than one huge commit.
-   **Descriptive Messages**: Use prefixes like `feat:`, `fix:`, `docs:` to explain *what* changed.
-   **Never Force Push**: Avoid `git push --force` on shared branches like `main`.
