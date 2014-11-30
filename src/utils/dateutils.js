module.exports = {
    getTomorrow: function () {
        var tomorrow = new Date();
        tomorrow.setDate(new Date().getDate() + 1);
        tomorrow.setHours(0);
        tomorrow.setMinutes(0);
        tomorrow.setSeconds(0);

        return tomorrow;
    },
    getToday: function () {
        var now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);

        return now;
    }
};
