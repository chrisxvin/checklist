<script lang="ts">
</script>

<svelte:head>
    <title>Preflight - 日常检查清单</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl px-4 py-12">
    <section class="card bg-gradient-to-br from-primary to-primary-700 text-primary-content shadow-lg">
        <div class="card-body items-center gap-6 p-10 text-center">
            <div class="mask mask-squircle bg-primary-content/15 p-4">
                <Icon icon="mdi:clipboard-check-outline" width="3rem" height="3rem" />
            </div>
            <div class="flex flex-col gap-3">
                <h1 class="text-4xl font-bold">Preflight</h1>
                <p class="max-w-lg text-lg text-primary-content/85">
                    把重复的工作固化成检查单模板，每一次执行都留下独立、可追溯的记录。
                </p>
            </div>
            <a href="/auth/login" class="btn btn-lg btn-accent mt-2">
                <Icon icon="mdi:google" width="1.2em" height="1.2em" />
                使用 Google 登录
            </a>
        </div>
    </section>

    <section class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-2">
                <span class="text-primary"><Icon icon="mdi:content-copy" width="1.6em" height="1.6em" /></span>
                <h3 class="text-lg font-semibold">模板 · 版本快照</h3>
                <p class="text-sm text-base-content/60">
                    模板每次定稿都会固化版本；执行记录基于当时的版本快照，后续修改不影响历史。
                </p>
            </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-2">
                <span class="text-primary"><Icon icon="mdi:playlist-check" width="1.6em" height="1.6em" /></span>
                <h3 class="text-lg font-semibold">三种执行模式</h3>
                <p class="text-sm text-base-content/60">
                    自由、顺序、严格三种模式，按需约束执行流程，步骤可标记可跳过。
                </p>
            </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-2">
                <span class="text-primary"><Icon icon="mdi:history" width="1.6em" height="1.6em" /></span>
                <h3 class="text-lg font-semibold">全程可追溯</h3>
                <p class="text-sm text-base-content/60">
                    每次执行记录开始/结束时间、逐项结果与备注，随时回看。
                </p>
            </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-2">
                <span class="text-primary"><Icon icon="mdi:account-lock-outline" width="1.6em" height="1.6em" /></span>
                <h3 class="text-lg font-semibold">按用户隔离</h3>
                <p class="text-sm text-base-content/60">
                    Google 登录，多设备会话；每个用户的模板与执行记录互不可见。
                </p>
            </div>
        </div>
    </section>
</div>
