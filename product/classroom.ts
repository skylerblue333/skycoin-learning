export type ClassroomRole = "instructor" | "learner";

export interface ClassroomMember {
  readonly subjectId: string;
  readonly role: ClassroomRole;
  readonly joinedAt: number;
}

export interface ClassroomSnapshot {
  readonly classroomId: string;
  readonly title: string;
  readonly ownerSubjectId: string;
  readonly members: readonly ClassroomMember[];
}

export interface ClassroomIntegrationContract {
  readonly classroomId: string;
  readonly memberSubjectIds: readonly string[];
}

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;
const MAX_TITLE = 160;

function safeId(label: string, input: string): string {
  const value = input.trim();
  if (!ID.test(value)) throw new TypeError(`${label} must be a 3-128 character safe identifier`);
  return value;
}

function safeTime(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError("timestamp must be a non-negative safe integer");
  return value;
}

function safeTitle(input: string): string {
  const title = input.trim().replace(/\s+/g, " ");
  if (!title || title.length > MAX_TITLE) throw new TypeError(`title must be 1-${MAX_TITLE} characters`);
  return title;
}

function safeRole(value: unknown): ClassroomRole {
  if (value !== "instructor" && value !== "learner") throw new TypeError("role must be instructor or learner");
  return value;
}

export class Classroom {
  readonly #classroomId: string;
  readonly #title: string;
  readonly #ownerSubjectId: string;
  readonly #members = new Map<string, ClassroomMember>();
  readonly #capacity: number;

  constructor(input: { classroomId: string; title: string; ownerSubjectId: string; capacity?: number }, now = Date.now()) {
    this.#classroomId = safeId("classroomId", input.classroomId);
    this.#title = safeTitle(input.title);
    this.#ownerSubjectId = safeId("ownerSubjectId", input.ownerSubjectId);
    this.#capacity = input.capacity ?? 500;
    if (!Number.isSafeInteger(this.#capacity) || this.#capacity < 1 || this.#capacity > 10_000) throw new TypeError("capacity must be 1-10000");
    this.#members.set(this.#ownerSubjectId, Object.freeze({ subjectId: this.#ownerSubjectId, role: "instructor", joinedAt: safeTime(now) }));
  }

  join(subjectId: string, role: ClassroomRole = "learner", now = Date.now()): ClassroomMember {
    const id = safeId("subjectId", subjectId);
    const normalizedRole = safeRole(role);
    if (id === this.#ownerSubjectId && normalizedRole !== "instructor") throw new Error("owner role cannot be downgraded");
    const existing = this.#members.get(id);
    if (existing) {
      if (existing.role !== normalizedRole) throw new Error("member already exists with a different role");
      return existing;
    }
    if (this.#members.size >= this.#capacity) throw new Error("classroom capacity reached");
    const member = Object.freeze({ subjectId: id, role: normalizedRole, joinedAt: safeTime(now) });
    this.#members.set(id, member);
    return member;
  }

  leave(subjectId: string): boolean {
    const id = safeId("subjectId", subjectId);
    if (id === this.#ownerSubjectId) throw new Error("classroom owner cannot leave without transfer/closure");
    return this.#members.delete(id);
  }

  hasMember(subjectId: string): boolean {
    return this.#members.has(safeId("subjectId", subjectId));
  }

  snapshot(): ClassroomSnapshot {
    return Object.freeze({
      classroomId: this.#classroomId,
      title: this.#title,
      ownerSubjectId: this.#ownerSubjectId,
      members: Object.freeze([...this.#members.values()].map(member => Object.freeze({ ...member }))),
    });
  }

  integrationContract(): ClassroomIntegrationContract {
    return Object.freeze({
      classroomId: this.#classroomId,
      memberSubjectIds: Object.freeze([...this.#members.keys()].sort()),
    });
  }
}
