# 验收基线标牌（ACCEPTANCE BASELINE）

> 本文件解决一个具体的坑：**仓库 HEAD 会继续往前走，但"被验收的是哪一版"必须一眼可见**。
> 平台自动预检**只读仓库默认分支** ⇒ 若默认分支上放的不是被验收的那一版，
> 预检就会判「在读到的内容里没有找到对应内容」（`acceptance=not_matched`）。

## 本次验收对应的 commit

| 订单 | 验收基线 commit |
|---|---|
| #1851 | `bfe2e13a03a1c53c822b5ef28b97e84ebcdc68c6` |
| #1896 | `bfe2e13a03a1c53c822b5ef28b97e84ebcdc68c6` |

⚠️ **本仓根目录同时存在两个代际，请先确认看哪一版**：

| 位置 | 是什么 | 说明 |
|---|---|---|
| `archive/1896-accepted-bfe2e13a/` | **本次验收所依据的那一版**（`bfe2e13a`）| 独立验收索引见该目录下的 `ACCEPTANCE.md` / `DELIVERY.md` / `TEST-REPORT.md` |
| `src/`（仓库根） | **后续代际**（面板注册表重构 + CI/门禁加固）| 属交付后改进，**不是被验收的那一版** |

⇒ 验收基线：`bfe2e13a03a1c53c822b5ef28b97e84ebcdc68c6`
⇒ 怎么看：`git show bfe2e13a` 或直接看 `archive/1896-accepted-bfe2e13a/`


## 两个代际怎么选

- **要复核/验收 #1851、#1896** ⇒ 看 `archive/1896-accepted-bfe2e13a/`（含它自己的 README、ACCEPTANCE.md、DELIVERY.md、TEST-REPORT.md 与 `docs/`）。
- **只想看当前在跑的界面** ⇒ 看仓库根的 `src/`（后续代际）。
- 两个代际**互不影响**：验收结论以基线为准；后续代际是交付后的重构与加固。

## 复跑（以基线为准）

```bash
# 取基线那一版（不改动工作区）
git fetch origin && git worktree add /tmp/baseline bfe2e13a03a1
# 或直接看已归档的目录（membership-dashboard 有）
```

## 提交时的状态（供复核）

- 平台侧：`status=submitted`、`latest_delivery_version=1`、托管已 `funded`。
- 自动预检**不是评审、不决定验收与付款**；验收结论以人工复核 + 本文件指向的基线为准。
