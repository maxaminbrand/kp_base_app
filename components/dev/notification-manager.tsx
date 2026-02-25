"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  sendToAllAction,
  sendToTopicAction,
  sendToUserAction,
  subscribeUserToTopicAction,
  unsubscribeUserFromTopicAction,
} from "@/app/dev/notifications/actions";

type ResultState =
  | { kind: "idle" }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };

function ResultBanner({ state }: { state: ResultState }) {
  if (state.kind === "idle") return null;

  return (
    <div className="rounded-xl border bg-background px-4 py-3 text-sm">
      <div className="font-medium">{state.kind === "ok" ? "Success" : "Error"}</div>
      <div className="mt-1 text-muted-foreground">{state.message}</div>
    </div>
  );
}

function buildFd(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

export function NotificationManager() {
  const [tab, setTab] = React.useState("send");
  const [result, setResult] = React.useState<ResultState>({ kind: "idle" });

  const [title, setTitle] = React.useState("Notification");
  const [body, setBody] = React.useState("");
  const [link, setLink] = React.useState("/");

  const [uid, setUid] = React.useState("");
  const [topic, setTopic] = React.useState("all");

  async function run(
    action: (fd: FormData) => Promise<any>,
    fd: FormData,
    okMsg: (res: any) => string
  ) {
    setResult({ kind: "idle" });
    try {
      const res = await action(fd);
      setResult({ kind: "ok", message: okMsg(res) });
    } catch (e: any) {
      setResult({ kind: "error", message: e?.message ?? "Request failed." });
    }
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        onValueChange={setTab}
        options={[
          { value: "send", label: "Send" },
          { value: "topics", label: "Topic Subscriptions" },
        ]}
      >
        <ResultBanner state={result} />

        {tab === "send" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border p-5">
              <div className="text-sm font-semibold">Message</div>
              <p className="mt-1 text-sm text-muted-foreground">
                These fields are used for all send actions.
              </p>

              <div className="mt-4 grid gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Body</label>
                  <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Optional body" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Link</label>
                  <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border p-5">
                <div className="text-sm font-semibold">Send to all users</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fan out via topic <span className="font-medium">all</span>.
                </p>

                <Button
                  className="mt-4 w-full"
                  type="button"
                  onClick={() =>
                    run(
                      sendToAllAction,
                      buildFd({ title, body, link }),
                      (res) => `Sent to all. messageId: ${res?.messageId ?? "(ok)"}`
                    )
                  }
                >
                  Send to all
                </Button>
              </div>

              <div className="rounded-2xl border p-5">
                <div className="text-sm font-semibold">Send to a specific user</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Uses tokens under{" "}
                  <span className="font-medium">profiles/{"{uid}"}/fcmTokens</span>.
                </p>

                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">User UID</label>
                  <Input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="uid" />
                </div>

                <Button
                  className="mt-4 w-full"
                  type="button"
                  disabled={!uid.trim()}
                  onClick={() =>
                    run(
                      sendToUserAction,
                      buildFd({ uid, title, body, link }),
                      (res) =>
                        `Attempted: ${res?.attempted ?? 0}, Success: ${res?.success ?? 0}, Failures: ${
                          res?.failures ?? 0
                        }, Deleted: ${res?.deleted ?? 0}`
                    )
                  }
                >
                  Send to user
                </Button>
              </div>

              <div className="rounded-2xl border p-5">
                <div className="text-sm font-semibold">Send to a topic</div>

                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="all | role_dev | business_123 | ..."
                  />
                </div>

                <Button
                  className="mt-4 w-full"
                  type="button"
                  disabled={!topic.trim()}
                  onClick={() =>
                    run(
                      sendToTopicAction,
                      buildFd({ topic, title, body, link }),
                      (res) => `Sent to topic "${topic}". messageId: ${res?.messageId ?? "(ok)"}`
                    )
                  }
                >
                  Send to topic
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "topics" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border p-5">
              <div className="text-sm font-semibold">Subscribe user to topic</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Subscribes every saved token for the UID to the topic.
              </p>

              <div className="mt-4 grid gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User UID</label>
                  <Input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="uid" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="role_dev | business_123 | ..." />
                </div>
              </div>

              <Button
                className="mt-4 w-full"
                type="button"
                disabled={!uid.trim() || !topic.trim()}
                onClick={() =>
                  run(
                    subscribeUserToTopicAction,
                    buildFd({ uid, topic }),
                    (res) =>
                      `UID: ${res?.uid ?? uid} — Topic: ${res?.topic ?? topic} — Tokens: ${
                        res?.tokens ?? 0
                      } — Subscribed: ${res?.subscribed ?? 0} — Failures: ${res?.failures ?? 0}`
                  )
                }
              >
                Subscribe
              </Button>
            </div>

            <div className="rounded-2xl border p-5">
              <div className="text-sm font-semibold">Unsubscribe user from topic</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Unsubscribes every saved token for the UID from the topic.
              </p>

              <div className="mt-4 grid gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User UID</label>
                  <Input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="uid" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="role_dev | business_123 | ..." />
                </div>
              </div>

              <Button
                className="mt-4 w-full"
                type="button"
                disabled={!uid.trim() || !topic.trim()}
                onClick={() =>
                  run(
                    unsubscribeUserFromTopicAction,
                    buildFd({ uid, topic }),
                    (res) =>
                      `UID: ${res?.uid ?? uid} — Topic: ${res?.topic ?? topic} — Tokens: ${
                        res?.tokens ?? 0
                      } — Unsubscribed: ${res?.unsubscribed ?? 0} — Failures: ${res?.failures ?? 0}`
                  )
                }
              >
                Unsubscribe
              </Button>
            </div>
          </div>
        ) : null}
      </Tabs>
    </div>
  );
}