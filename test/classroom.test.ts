import assert from "node:assert/strict";
import test from "node:test";
import { Classroom } from "../product/classroom.js";

test("owner is instructor and learner can join", () => {
  const classroom = new Classroom({ classroomId: "class:001", title: "  Intro   to Systems ", ownerSubjectId: "user:teacher" }, 10);
  classroom.join("user:learner", "learner", 11);
  const snapshot = classroom.snapshot();
  assert.equal(snapshot.title, "Intro to Systems");
  assert.equal(snapshot.members.length, 2);
  assert.deepEqual(classroom.integrationContract(), { classroomId: "class:001", memberSubjectIds: ["user:learner", "user:teacher"] });
});

test("join is idempotent for same role", () => {
  const classroom = new Classroom({ classroomId: "class:002", title: "Math", ownerSubjectId: "user:teacher" }, 1);
  const first = classroom.join("user:learner", "learner", 2);
  const second = classroom.join("user:learner", "learner", 3);
  assert.deepEqual(first, second);
});

test("owner cannot leave or be downgraded", () => {
  const classroom = new Classroom({ classroomId: "class:003", title: "Security", ownerSubjectId: "user:teacher" }, 1);
  assert.throws(() => classroom.leave("user:teacher"), /owner cannot leave/);
  assert.throws(() => classroom.join("user:teacher", "learner", 2), /cannot be downgraded/);
});

test("capacity and identifiers are enforced", () => {
  const classroom = new Classroom({ classroomId: "class:004", title: "Bounded", ownerSubjectId: "user:teacher", capacity: 1 }, 1);
  assert.throws(() => classroom.join("user:learner", "learner", 2), /capacity/);
  assert.throws(() => classroom.hasMember("x"), /subjectId/);
});

test("runtime callers cannot inject unsupported classroom roles", () => {
  const classroom = new Classroom({ classroomId: "class:005", title: "Roles", ownerSubjectId: "user:teacher" }, 1);
  assert.throws(
    () => classroom.join("user:learner", "administrator" as never, 2),
    /role must be instructor or learner/,
  );
  assert.equal(classroom.hasMember("user:learner"), false);
});
