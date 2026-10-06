---
title: Learning how to learn
titleVi: Học cách học
description: A simple map for turning questions into understanding and practice.
descriptionVi: Từ câu hỏi đến hiểu biết và thực hành.
cover: /assets/projects/anhoc.png
coverAlt: Learning application preview
type: learning
order: 2
nodes:
  - id: learning
    label: Learn with purpose
    cover: /assets/projects/anhoc.png
    labelVi: Học có mục đích
    description: Choose something you want to understand or be able to do.
    descriptionVi: Chọn điều bạn muốn hiểu hoặc có thể làm được.
  - id: questions
    label: Ask questions
    cover: /assets/projects/anhoc.png
    labelVi: Đặt câu hỏi
    description: Write down what you know, what you do not know, and why it matters.
    descriptionVi: Viết ra điều đã biết, chưa biết và lý do cần tìm hiểu.
  - id: explore
    href: /journal/2026-09-15-dumbphobia-20-rl-techniques
    label: Explore
    cover: /assets/projects/anhoc.png
    labelVi: Khám phá
    description: Read, observe, and connect new ideas to what you already know.
    descriptionVi: Đọc, quan sát và liên hệ ý tưởng mới với kiến thức đã có.
  - id: practice
    label: Practice
    cover: /assets/projects/anhoc.png
    labelVi: Thực hành
    description: Try a small exercise or build something that uses the idea.
    descriptionVi: Thử một bài tập nhỏ hoặc tạo sản phẩm áp dụng ý tưởng đó.
  - id: explain
    label: Explain it simply
    cover: /assets/projects/anhoc.png
    labelVi: Giải thích đơn giản
    description: Explain the idea in your own words and notice any gaps.
    descriptionVi: Giải thích bằng lời của mình và nhận ra chỗ còn thiếu.
  - id: reflect
    label: Reflect and revisit
    cover: /assets/projects/anhoc.png
    labelVi: Suy ngẫm và ôn lại
    description: Review what worked and choose your next question.
    descriptionVi: Xem lại điều hiệu quả và chọn câu hỏi tiếp theo.
edges:
  - source: learning
    target: questions
  - source: learning
    target: explore
  - source: learning
    target: practice
  - source: explore
    target: explain
  - source: practice
    target: reflect
---
