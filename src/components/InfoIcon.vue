<template>
    <div class="info-icon" @mouseenter="showTooltip" @mouseleave="hideTooltip">
        <!-- 信息图标，可以用 svg 或者字体图标 -->
        <svg
xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"
            class="icon">
            <path
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm.93-10.412-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 .875-.252 1.02-.598l.088-.416c.054-.232.01-.352-.176-.464l-.451-.25c-.194-.108-.233-.194-.176-.42l.738-3.468c.194-.897-.105-1.319-.808-1.319-.545 0-.875.252-1.02.598l-.088.416zM8 5.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1z" />
        </svg>

        <div v-if="visible" class="tooltip">
            {{ text }}
        </div>
    </div>
</template>

<script>
export default {
    name: "InfoIcon",
    props: {
        text: {
            type: String,
            default: "这里是提示信息",
        },
    },
    data() {
        return {
            visible: false,
        };
    },
    methods: {
        showTooltip() {
            this.visible = true;
        },
        hideTooltip() {
            this.visible = false;
        },
    },
};
</script>

<style scoped>
.info-icon {
    position: relative;
    display: inline-block;
    cursor: pointer;
    color: #1890ff;
    /* 信息蓝色 */
}

.icon {
    vertical-align: middle;
}

.tooltip {
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(60, 60, 60, 0.9);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 12px;
    z-index: 10;
    opacity: 0.9;
    pointer-events: none;
    user-select: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
