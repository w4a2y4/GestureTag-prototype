library("ARTool")
require(nlme) 
library("multcomp")
require(lsmeans)
library("lsmeans")
library("PMCMRplus")

Users<-c("1","2","3","4","5","6","7")
Modes<-c("Swipe","Dwell","EyeGesture","Tap")
SpacingAll<-c(0,0.5,1)
BtnSizeAll<-c(16,32,48)
SpacingFactors<-c("I","II","III")
BtnSizeFactors<-c("mid")

AllUser_CompletionTime<-matrix(0,length(Users),length(Modes)*9)
AllPerformanceDataUser<-matrix(0,length(Users)*length(Modes)*3,1)
AllPerformanceDataMethod<-matrix(0,length(Users)*length(Modes)*3,1)
AllPerformanceDataBtnSize<-matrix(0,length(Users)*length(Modes)*3,1)
AllPerformanceDataSpacing<-matrix(0,length(Users)*length(Modes)*3,1)
AllPerformanceDataTime<-matrix(0,length(Users)*length(Modes)*3,1)
AllPerformanceDataError<-matrix(0,length(Users)*length(Modes)*3,1)
GraphData<-matrix(0,36,7)


datacount=1;

##Data process
for(iUser in c(1:length(Users))){
	for(imode in c(1:length(Modes))){ 		
	##read Motor data
	filename=paste0("/Users/mhci430/Documents/R06922088/GestureTag/GestureTag_DataAnalysis/parsed/Motor/Motor",Users[iUser],"/tw_",Users[iUser],"__",Modes[imode],"..csv")
	
	##read Normal data
	#filename=paste0("/Users/mhci430/Documents/R06922088/GestureTag/GestureTag_DataAnalysis/parsed/Normal/Normal",Users[iUser],"/tw_",Users[iUser],"__",Modes[imode],"..csv")

	
	Data<-read.csv(filename,header=TRUE)
	##Data<-read.table(filename)
	##Data<-read.table(paste0("/Users/aldrich/Documents/GestureTag_DataAnalysis/Motor2/Swipe_user2_motor.txt"))
		for(iBtnSize in c(1:1)){
			for(iSpacing in c(3:3)){
				Spacing=Data[,6]
				TempData=Data[which(Spacing==SpacingAll[iSpacing]),]
				ButtonSize=TempData[,5]
				TempData2=TempData[which(ButtonSize==BtnSizeAll[iBtnSize]),]
				NotTimeoutData=TempData2[which(TempData2[,1]!=-1),]
				CorrectData=NotTimeoutData[which(NotTimeoutData[,2]==0),]
 				AllUser_CompletionTime[iUser,(imode-1)*9+(iBtnSize-1)*3+iSpacing ]<-mean(CorrectData[,1])
 				
 				AllPerformanceDataUser[datacount,1]<-iUser
 				AllPerformanceDataMethod[datacount,1]<-Modes[imode]
 				AllPerformanceDataBtnSize[datacount,1]<-BtnSizeFactors[iBtnSize]
 				AllPerformanceDataSpacing[datacount,1]<-SpacingFactors[iSpacing]
 				AllPerformanceDataTime[datacount,1]<-log(mean(CorrectData[,1],na.rm=TRUE)/3000,3);
				AllPerformanceDataError[datacount,1]<-sum(NotTimeoutData[,2]/length(NotTimeoutData[,2]));
				
 				##if(!is.nan(mean(CorrectData[,1]))){
 				##	AllPerformanceData[datacount,5]<-mean(CorrectData[,1]);
 				##}
 				##else{
 				##	AllPerformanceData[datacount,5]<-15000.0;
 				##} 				
 				
 				datacount=datacount+1;
			}
 		}
	}
}
# graphdata=1;
# for(imode in c(1:length(Modes))){ 		
		# for(iBtnSize in c(1:3)){
			# for(iSpacing in c(1:3)){
				# A=which(AllPerformanceDataSpacing==SpacingFactors[iSpacing])
				# B=which(AllPerformanceDataBtnSize==BtnSizeFactors[iBtnSize])
				# C=which(AllPerformanceDataMethod==Modes[imode])
				# D=intersect(A,B)
				# TempData1=AllPerformanceDataTime[intersect(D,C),]
				# TempData1
				# TempData2=AllPerformanceDataError[intersect(D,C),]
				# GraphData[graphdata,1]<-Modes[imode]
				# GraphData[graphdata,2]<-BtnSizeFactors[iBtnSize]
				# GraphData[graphdata,3]<-SpacingFactors[iSpacing]
				# GraphData[graphdata,4]<-mean(TempData1,na.rm=TRUE)
				# GraphData[graphdata,5]<-sqrt(var(TempData1,na.rm=TRUE))
				# GraphData[graphdata,6]<-mean(TempData2,na.rm=TRUE)
				# GraphData[graphdata,7]<-var(TempData2)
				
				# graphdata=graphdata+1
			# }
 		# }
	# }


  # write.table(GraphData,file="/Users/mhci430/Documents/R06922088/GestureTag/GestureTag_DataAnalysis/ＧraphData.csv",sep=",",row.names=F)

# myDataFrame<-data.frame(UserID=AllPerformanceDataUser[1:nrow(AllPerformanceData),1],Method=AllPerformanceDataMethod[1:nrow(AllPerformanceData),1],ButtonSize=AllPerformanceDataBtnSize[1:nrow(AllPerformanceData),1],Spacing=AllPerformanceDataSpacing[1:nrow(AllPerformanceData),1],CompletionTime=AllPerformanceDataTime[1:nrow(AllPerformanceData),1])

myDataFrame<-data.frame(UserID=AllPerformanceDataUser[1:nrow(AllPerformanceDataUser),1],Method=AllPerformanceDataMethod[1:nrow(AllPerformanceDataMethod),1],Spacing=AllPerformanceDataSpacing[1:nrow(AllPerformanceDataSpacing),1],CompletionTime=AllPerformanceDataTime[1:nrow(AllPerformanceDataTime),1])

##completion Time :ANOVA

##aov2 <- lme(fixed= CompletionTime~Method*ButtonSize*Spacing, random=~1|UserID, na.action=na.omit, data=myDataFrame) 
aov2 <- lme(fixed= CompletionTime~Method, random=~1|UserID, na.action=na.omit, data=myDataFrame) 

summary(aov2) 
anova(aov2)
Turkey.HSD.results<-glht(aov2,linfct=mcp(Method='Tukey'))
summary(Turkey.HSD.results)

lsmeans(lm(aov2, "Method"), pairwise ~ Method)
model<-aov(CompletionTime~Method*ButtonSize*Spacing+Error(factor(UserID)), na.action=na.omit, data=myDataFrame)
#pairwise.t.test(CompletionTime,Method,p.adjust.method="none")
TukeyHSD(model,"Method",ordered=TRUE) 

#TimeDataFrame<-data.frame(UserID=AllPerformanceDataUser[1:nrow(AllPerformanceData),1],Method=AllPerformanceDataMethod[1:nrow(AllPerformanceData),1],ButtonSize=AllPerformanceDataBtnSize[1:nrow(AllPerformanceData),1],Spacing=AllPerformanceDataSpacing[1:nrow(AllPerformanceData),1],CompletionTime=AllPerformanceDataTime[1:nrow(AllPerformanceData),1])

#m<-art(CompletionTime~factor(Method)*factor(ButtonSize)*factor(Spacing)+Error(UserID),data=TimeDataFrame)
 


##Error Rate :ART

ErrorDataFrame<-data.frame(UserID=AllPerformanceDataUser[1:nrow(AllPerformanceData),1],Method=AllPerformanceDataMethod[1:nrow(AllPerformanceData),1],ButtonSize=AllPerformanceDataBtnSize[1:nrow(AllPerformanceData),1],Spacing=AllPerformanceDataSpacing[1:nrow(AllPerformanceData),1],ErrorCount=AllPerformanceDataError[1:nrow(AllPerformanceData),1])
boxplot(ErrorCount~Method,data=ErrorDataFrame, main="ErrorCount")


m<-art(ErrorCount~Method*ButtonSize*Spacing+Error(factor(UserID)),data=ErrorDataFrame)
anova(m)
lsmeans(artlm(m, "Method"), pairwise ~ Method)


##Preference Data Analysis
rankfilename="/Users/mhci430/Documents/R06922088/GestureTag/GestureTag_DataAnalysis/Motor_Preference.csv"
rankData<-read.csv(rankfilename,header=TRUE)
PreferenceDataFrame<-data.frame(UserID=rankData[1:nrow(rankData),1],Method=rankData[1:nrow(rankData),2],Score=rankData[1:nrow(rankData),3])

MatrixData<-matrix(0,7,4)
rankUsers<-c(2,3,4,7,12,13,17)
colnames(MatrixData)<- c("Mouse","Dwell","GestureTag","EyeGesture")
for(i in c(1:7)){
	ThisUserRank<-rankData[which(rankData[,1]==rankUsers[i]),]
	MatrixData[i,1]<-ThisUserRank[1,3]
	MatrixData[i,2]<-ThisUserRank[2,3]
	MatrixData[i,3]<-ThisUserRank[3,3]
	MatrixData[i,4]<-ThisUserRank[4,3]

}
Overall_pre<-friedman.test(Score~Method|UserID,data=PreferenceDataFrame)
Overall_pre_pair_hard<-posthoc.friedman.nemenyi.test(Score~Method|UserID,data=PreferenceDataFrame)

Overall_pre_pair_easy<-posthoc.friedman.conover.test(MatrixData,p.adjust="bonf")

Overall_pre
Overall_pre_pair_hard
Overall_pre_pair_hard2
Overall_pre_pair_easy



##NASA Data Analysis
NASAfilename="/Users/mhci430/Documents/R06922088/GestureTag/GestureTag_DataAnalysis/Study1_NASA_Motor.csv"
NASAData<-read.csv(NASAfilename,header=TRUE)
NANADataFrame<-data.frame(UserID=NASAData[1:nrow(NASAData),1],Method=NASAData[1:nrow(NASAData),2],Score=NASAData[1:nrow(NASAData),10])
Overall_pre<-friedman.test(Score~Method|UserID,data=NANADataFrame)
Overall_pre_pair<-posthoc.friedman.nemenyi.test(Score~Method|UserID,data=NANADataFrame)
Overall_pre
Overall_pre_pair

