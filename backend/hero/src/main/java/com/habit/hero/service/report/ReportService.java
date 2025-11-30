package com.habit.hero.service.report;


import com.habit.hero.dao.HabitDao;
import com.habit.hero.dao.HabitLogDao;
import com.habit.hero.dto.report.*;
import com.habit.hero.entity.Habit;
import com.habit.hero.entity.HabitLog;
import com.habit.hero.enums.GoalType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.habit.hero.enums.Cadence;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;


@Slf4j
@Service
public class ReportService {

    private final HabitDao habitDao;
    private final HabitLogDao habitLogDao;

    @Autowired
    public ReportService(HabitDao habitDao, HabitLogDao habitLogDao) {
        this.habitDao = habitDao;
        this.habitLogDao = habitLogDao;
    }


    public WeeklyReportResponse generateWeeklyReport(
            Long userId, LocalDate startDate, LocalDate endDate, Long habitId
    ) {
        log.info("Generating weekly report for userId: {}, habitId: {}, period: {} to {}", 
                userId, habitId, startDate, endDate);
        try {
            if (userId == null || habitId == null || startDate == null || endDate == null) {
                throw new IllegalArgumentException("Required parameters cannot be null");
            }
            Optional<Habit> habitOpt = habitDao.findByIdAndUserId(habitId, userId);
            if (habitOpt.isEmpty()) {
                log.warn("Habit not found for habitId: {} and userId: {}", habitId, userId);
                throw new IllegalArgumentException("Habit not found for userId: " + userId + " and habitId: " + habitId);
            }
            Habit habit = habitOpt.get();
            log.debug("Found habit: {} for user: {}", habit.getTitle(), userId);

            HabitReportData data = calculateHabitStats(habit, startDate, endDate);
            WeeklyReportResponse response = new WeeklyReportResponse();

            response.setWeekRange(new WeekRange(startDate, endDate));
            response.setHabit(data);
            response.setSummary(calculateSummary(habit));
            
            log.info("Weekly report generated successfully for habitId: {}", habitId);
            return response;
        }catch (NoSuchElementException e) {
            log.error("Habit not found for userId: {}, habitId: {}", userId, habitId);
            throw e;
        } catch (IllegalArgumentException e) {
            log.error("Invalid parameters for weekly report: {}", e.getMessage());
            throw e;
        }
        catch (Exception e) {
            log.error("Error generating weekly report for userId: {}, habitId: {}: {}", 
                    userId, habitId, e.getMessage(), e);
            throw e;
        }
    }

    private HabitSummary calculateSummary( Habit habit) {
        log.debug("Calculating summary for habit: {}", habit.getId());

        List<HabitLog> habitLogList = habitLogDao.findByHabitId(habit.getId());
        if (habitLogList == null) {
            log.warn("No habit logs found for habitId: {}", habit.getId());
            return new HabitSummary(0, 0d, 0, 0, null);
        }

        HabitSummary summary = new HabitSummary();

        if(habit.getCadence() == null || habit.getStartDate() == null){
            log.warn("Habit cadence is null for habitId: {}", habit.getId());
            return new HabitSummary(0, 0d, 0, 0, null);
        }

        LocalDate today = LocalDate.now();

        Integer totalDaysSinceStart = Math.toIntExact(ChronoUnit.DAYS.between(habit.getStartDate(), today));
        long totalWeeks = (totalDaysSinceStart + 6) / 7;
        long totalMonths = (totalDaysSinceStart + 29) / 30;
        Double expectedValue = 0d;
        Double completionCount= 0d;


        if(habit.getCadence() != Cadence.DAILY) {
            if (habit.getGoalType() != GoalType.OFF) {
                if(habit.getTargetValue() != null && habit.getSessionCount() != null) {
                    if(habit.getCadence() == Cadence.WEEKLY) {

                        expectedValue = habit.getTargetValue().multiply(BigDecimal.valueOf(habit.getSessionCount()).multiply(BigDecimal.valueOf(totalWeeks))).doubleValue();
                        summary.setTotalMissedDays((int) (totalWeeks * habit.getSessionCount() - habitLogList.size()));
                    }
                    else if(habit.getCadence() == Cadence.MONTHLY) {
                        expectedValue = habit.getTargetValue().multiply(BigDecimal.valueOf(habit.getSessionCount()).multiply(BigDecimal.valueOf(totalMonths))).doubleValue();
                        summary.setTotalMissedDays((int) (totalMonths * habit.getSessionCount() - habitLogList.size()));
                    }
                    for (HabitLog log : habitLogList) {
                        if (log.getAcutalValue() != null) {
                            completionCount += log.getAcutalValue().doubleValue();
                        }
                    }
                }
            }
            else{
                if(habit.getCadence() == Cadence.WEEKLY){
                    expectedValue = (double) (habit.getSessionCount() * totalWeeks);
                } else if(habit.getCadence() == Cadence.MONTHLY){
                    expectedValue = (double) (habit.getSessionCount() * totalMonths);
                }
                completionCount = (double) habitLogList.size();
            }
        }
        else  {
            if(habit.getGoalType() != GoalType.OFF){
                expectedValue = (habit.getTargetValue().multiply(BigDecimal.valueOf(totalDaysSinceStart))).doubleValue();
                for(HabitLog log :habitLogList){
                    if(log.getAcutalValue() !=null) {
                        completionCount += log.getAcutalValue().doubleValue();
                    }
                }
            }
            else{
                expectedValue = (double)totalDaysSinceStart;
                completionCount = (double) habitLogList.size();
            }
            summary.setTotalMissedDays(totalDaysSinceStart - habitLogList.size());
        }

        double overallRate = expectedValue > 0?  Math.round((completionCount / (double)expectedValue) * 10000) / 100.0 : 0.0;
        summary.setCompletionRate(Math.min(overallRate, 100));


        summary.setCurrentStreak(calculateStreak(habitLogList, habit));
        
        log.debug("Summary calculated for habit {}: completion rate {}%, streak {}", 
                habit.getId(), summary.getCompletionRate(), summary.getCurrentStreak());

        List<LocalDate> dates = habitLogList.stream()
                .map(HabitLog::getLogDate)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());
        summary.setHabitCompletions(dates);
        return summary;
    }

    private HabitReportData calculateHabitStats(
            Habit habit, LocalDate startDate, LocalDate endDate
    ) {
        log.debug("Calculating habit stats for habit: {} between {} and {}", 
                habit.getId(), startDate, endDate);
                
        List<HabitLog> thisWeekCompletions = habitLogDao.findByHabitIdAndLogDateBetweenOrderByLogDate( habit.getId(), startDate, endDate);

        LocalDate prevStart = startDate.minusWeeks(1);
        LocalDate prevEnd = endDate.minusWeeks(1);
        List<HabitLog> prevWeekCompletions = habitLogDao.findByHabitIdAndLogDateBetweenOrderByLogDate(habit.getId(), prevStart, prevEnd);
        
        log.debug("Found {} completions this week, {} completions previous week for habit: {}", 
                thisWeekCompletions.size(), prevWeekCompletions.size(), habit.getId());

        HabitReportData data = new HabitReportData();

        data.setHabitId(habit.getId());
        data.setHabitName(habit.getTitle());
        data.setCategory(habit.getCategory());
        data.setCadence(habit.getCadence());
        data.setSessionCount(habit.getSessionCount());
        data.setStartDate(habit.getStartDate());
        data.setTargetValue(habit.getTargetValue());
        data.setStatus(habit.getStatus());

        Double expectedValue;
        Double thisWeekCount = 0d ;
        Double prevWeekCount =0d;

        WeekStats thisWeekStats = new WeekStats();
        WeekStats prevWeekStats = new WeekStats();

        if(habit.getCadence() != Cadence.DAILY) {
            if (habit.getGoalType() != GoalType.OFF) {
                expectedValue = habit.getTargetValue().multiply(BigDecimal.valueOf(habit.getSessionCount())).doubleValue();

                for(int i = 0;i<thisWeekCompletions.size();i++){
                    thisWeekCount += thisWeekCompletions.get(i).getAcutalValue().doubleValue();
                }

                for(int i = 0;i<prevWeekCompletions.size();i++){
                    prevWeekCount += prevWeekCompletions.get(i).getAcutalValue().doubleValue();
                }
            }

            else{
                expectedValue = habit.getSessionCount().doubleValue();
                thisWeekCount = (double) thisWeekCompletions.size();
                prevWeekCount = (double) prevWeekCompletions.size();
            }
            thisWeekStats.setMissedDays(habit.getSessionCount() - thisWeekCompletions.size());
            prevWeekStats.setMissedDays(habit.getSessionCount() - prevWeekCompletions.size());
        }

        else  {
            if(habit.getGoalType() != GoalType.OFF){
                expectedValue = habit.getTargetValue().multiply(BigDecimal.valueOf(7)).doubleValue();

                for(int i = 0;i<thisWeekCompletions.size();i++){
                    thisWeekCount += thisWeekCompletions.get(i).getAcutalValue().doubleValue();
                }

                for(int i = 0;i<prevWeekCompletions.size();i++){
                    prevWeekCount += prevWeekCompletions.get(i).getAcutalValue().doubleValue();
                }
            }
            else{
                expectedValue = 7d;
                thisWeekCount = (double) thisWeekCompletions.size();
                prevWeekCount = (double) prevWeekCompletions.size();

            }
            thisWeekStats.setMissedDays(7 - thisWeekCompletions.size());
            prevWeekStats.setMissedDays(7 - prevWeekCompletions.size());
        }

        double thisWeekRate = Math.round((thisWeekCount / (double)expectedValue) * 10000) / 100.0;
        double prevWeekRate = Math.round((prevWeekCount / (double)expectedValue) * 10000) / 100.0;

        thisWeekStats.setCompletions(thisWeekCount);
        prevWeekStats.setCompletions(prevWeekCount);

        thisWeekStats.setCompletionPercentage(Math.min(thisWeekRate, 100));
        prevWeekStats.setCompletionPercentage(Math.min(prevWeekRate,100));

        data.setThisWeek(thisWeekStats);
        data.setPreviousWeek(prevWeekStats);

        WeekComparison comparison = new WeekComparison();
        comparison.setMissedDaysDiff(thisWeekStats.getMissedDays()-prevWeekStats.getMissedDays());
        comparison.setCompletionsDiff(thisWeekCount - prevWeekCount);
        comparison.setPercentageDiff(Math.round((thisWeekRate - prevWeekRate)*100)/100.0);

        data.setWeekOverWeekChange(comparison);

        return data;
    }

    private Integer calculateStreak(List<HabitLog> completions, Habit habit) {
        log.debug("Calculating streak for habit: {} with {} completions", 
                habit.getId(), completions != null ? completions.size() : 0);
                
        if (completions == null || completions.isEmpty()) {
            log.debug("No completions found, streak is 0 for habit: {}", habit.getId());
            return 1;
        }
        // Get distinct dates and sort descending (newest first)
        List<LocalDate> dates = completions.stream()
                .map(HabitLog::getLogDate)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        if (dates.isEmpty()) {
            return 1;
        }

        // Check if most recent completion is today or yesterday
        LocalDate today = LocalDate.now();
        LocalDate mostRecent = dates.get(0);

        int currentStreak = 1;
        LocalDate expectedDate;

        if (habit.getCadence() == Cadence.WEEKLY) {
            // If last completion is more than 1 week ago, streak is broken
            long daysSinceLastCompletion = ChronoUnit.DAYS.between(mostRecent, today);
            if (daysSinceLastCompletion > 7- habit.getSessionCount()) {
                return 0; // Streak broken
            }
            expectedDate = mostRecent.minusDays(7- habit.getSessionCount());
            for (int i = 1; i < dates.size(); i++) {
                LocalDate currentDate = dates.get(i);
                // Check if current date is the expected consecutive date
                if (currentDate.isAfter(expectedDate)) {
                    currentStreak++;
                    expectedDate = expectedDate.minusDays(7- habit.getSessionCount()); // Move to next expected date
                } else {
                    // Gap found - streak ends
                    break;
                }
            }
        }
        if(habit.getCadence() == Cadence.DAILY){
            // If last completion is more than 1 day ago, streak is broken
            long daysSinceLastCompletion = ChronoUnit.DAYS.between(mostRecent, today);
            if (daysSinceLastCompletion > 1) {
                return 0; // Streak broken
            }
            expectedDate = mostRecent.minusDays(1);
            for (int i = 1; i < dates.size(); i++) {
                LocalDate currentDate = dates.get(i);
                // Check if current date is the expected consecutive date
                if (currentDate.equals(expectedDate)) {
                    currentStreak++;
                    expectedDate = expectedDate.minusDays(1); // Move to next expected date
                } else {
                    // Gap found - streak ends
                    break;
                }
            }
        }
         if(habit.getCadence() ==  Cadence.MONTHLY){
             long daysSinceLastCompletion = ChronoUnit.DAYS.between(mostRecent, today);
             if (daysSinceLastCompletion > 30 - habit.getSessionCount()) {
                 return 0; // Streak broken
             }
             expectedDate = mostRecent.minusDays(30- habit.getSessionCount());
             for (int i = 1; i < dates.size(); i++) {
                 LocalDate currentDate = dates.get(i);
                 // Check if current date is the expected consecutive date
                 if (currentDate.isAfter(expectedDate)) {
                     currentStreak++;
                     expectedDate = expectedDate.minusDays(30- habit.getSessionCount()); // Move to next expected date
                 } else {
                     // Gap found - streak ends
                     break;
                 }
             }
         }
        return currentStreak;
    }
}
